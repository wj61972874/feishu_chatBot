const Koa = require('koa')
const Router = require('koa-router')
const axios = require('axios')
const CryptoJS = require('crypto-js')
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors'); // 引入 koa-cors
const serverConfig = require('./server_config')
const serverUtil = require('./server_util')

const routerApi=require('./api')

const LJ_JSTICKET_KEY = 'lk_jsticket'
const LJ_TOKEN_KEY = 'lk_token'

//处理免登请求，返回用户的user_access_token
async function getUserAccessToken(ctx) {

    console.log("\n-------------------[接入服务端免登处理 BEGIN]-----------------------------")
    serverUtil.configAccessControl(ctx)
    console.log(`接入服务方第① 步: 接收到前端免登请求`)
    const accessToken = ctx.session.userinfo
    const lkToken = ctx.cookies.get(LJ_TOKEN_KEY) || ''
    if (accessToken && accessToken.access_token && lkToken.length > 0 && accessToken.access_token == lkToken) {
        console.log("接入服务方第② 步: 从Session中获取user_access_token信息，用户已登录")
        ctx.body = serverUtil.okResponse(accessToken)
        console.log("-------------------[接入服务端免登处理 END]-----------------------------\n")
        return
    }

    let code = ctx.query["code"] || ""
    console.log("接入服务方第② 步: 获取登录预授权码code")
    if (code.length == 0) { //code不存在
        ctx.body = serverUtil.failResponse("登录预授权码code is empty, please retry!!!")
        return
    }

    //【请求】app_access_token：https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/app_access_token_internal
    console.log("接入服务方第③ 步: 根据AppID和App Secret请求应用授权凭证app_access_token")
    const internalRes = await axios.post("https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal", {
        "app_id": serverConfig.config.appId,
        "app_secret": serverConfig.config.appSecret
    }, { headers: { "Content-Type": "application/json" } })

    if (!internalRes.data) {
        ctx.body = serverUtil.failResponse("app_access_token request error")
        return
    }
    if (internalRes.data.code != 0) { //非0表示失败
        ctx.body = serverUtil.failResponse(`app_access_token request error: ${internalRes.data.msg}`)
        return
    }

    console.log("接入服务方第④ 步: 获得颁发的应用授权凭证app_access_token")
    const app_access_token = internalRes.data.app_access_token || ""

    console.log("接入服务方第⑤ 步: 根据登录预授权码code和app_access_token请求用户授权凭证user_access_token")
    //【请求】user_access_token: https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/access_token/create
    const authenv1Res = await axios.post("https://open.feishu.cn/open-apis/authen/v1/access_token", { "grant_type": "authorization_code", "code": code }, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Bearer " + app_access_token
        }
    })

    if (!authenv1Res.data) {
        ctx.body = serverUtil.failResponse("access_toke request error")
        return
    }
    if (authenv1Res.data.code != 0) {  //非0表示失败
        ctx.body = serverUtil.failResponse(`access_toke request error: ${authenv1Res.data.msg}`)
        return
    }

    console.log("接入服务方第⑥ 步: 获取颁发的用户授权码凭证的user_access_token, 更新到Session，返回给前端")
    const newAccessToken = authenv1Res.data.data
    if (newAccessToken) {
        ctx.session.userinfo = newAccessToken
        serverUtil.setCookie(ctx, LJ_TOKEN_KEY, newAccessToken.access_token || '')
    } else {
        serverUtil.setCookie(ctx, LJ_TOKEN_KEY, '')
    }

    ctx.body = serverUtil.okResponse(newAccessToken)
    console.log("-------------------[接入服务端免登处理 END]-----------------------------\n")
}

//处理鉴权参数请求，返回鉴权参数
async function getSignParameters(ctx) {

    console.log("\n-------------------[接入方服务端鉴权处理 BEGIN]-----------------------------")
    serverUtil.configAccessControl(ctx)
    console.log(`接入服务方第① 步: 接收到前端鉴权请求`)

    const url = ctx.query["url"] ||""
    const tickeString = ctx.cookies.get(LJ_JSTICKET_KEY) || ""
    if (tickeString.length > 0) {
        console.log(`接入服务方第② 步: Cookie中获取jsapi_ticket，计算JSAPI鉴权参数，返回`)
        const signParam = calculateSignParam(tickeString, url)
        ctx.body = serverUtil.okResponse(signParam)
        console.log("-------------------[接入方服务端鉴权处理 END]-----------------------------\n")
        return
    }

    console.log(`接入服务方第② 步: 未检测到jsapi_ticket，根据AppID和App Secret请求自建应用授权凭证tenant_access_token`)
    //【请求】tenant_access_token：https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal
    const internalRes = await axios.post("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
        "app_id": serverConfig.config.appId,
        "app_secret": serverConfig.config.appSecret
    }, { headers: { "Content-Type": "application/json" } })

    if (!internalRes.data) {
        ctx.body = serverUtil.failResponse('tenant_access_token request error')
        return
    }
    if (internalRes.data.code != 0) {
        ctx.body = serverUtil.failResponse(`tenant_access_token request error: ${internalRes.data.msg}`)
        return
    }

    console.log(`接入服务方第③ 步: 获得颁发的自建应用授权凭证tenant_access_token`)
    const tenant_access_token = internalRes.data.tenant_access_token ||""

    console.log(`接入服务方第④ 步: 请求JSAPI临时授权凭证`)
    //【请求】jsapi_ticket：https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/h5_js_sdk/authorization
    const ticketRes = await axios.post("https://open.feishu.cn/open-apis/jssdk/ticket/get", {}, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Bearer " + tenant_access_token
        }
    })

    if (!ticketRes.data) {
        ctx.body = serverUtil.failResponse('get jssdk ticket request error')
        return
    }
    if (ticketRes.data.code != 0) { //非0表示失败
        ctx.body = serverUtil.failResponse(`get jssdk ticket request error: ${ticketRes.data.msg}`)
        return
    }

    console.log(`接入服务方第⑤ 步: 获得颁发的JSAPI临时授权凭证，更新到Cookie`)
    const newTicketString = ticketRes.data.data.ticket || ""
    if (newTicketString.length > 0) {
        serverUtil.setCookie(ctx, LJ_JSTICKET_KEY, newTicketString)
    }

    console.log(`接入服务方第⑥ 步: 计算出JSAPI鉴权参数，并返回给前端`)
    const signParam = calculateSignParam(newTicketString, url)
    ctx.body = serverUtil.okResponse(signParam)
    console.log("-------------------[接入方服务端鉴权处理 END]-----------------------------\n")
}

//计算鉴权参数
function calculateSignParam(tickeString, url) {
    const timestamp = (new Date()).getTime()
    const verifyStr = `jsapi_ticket=${tickeString}&noncestr=${serverConfig.config.noncestr}&timestamp=${timestamp}&url=${url}`
    let signature = CryptoJS.SHA1(verifyStr).toString(CryptoJS.enc.Hex)
    const signParam = {
        "app_id": serverConfig.config.appId,
        "signature": signature,
        "noncestr": serverConfig.config.noncestr,
        "timestamp": timestamp,
    }
    return signParam
}

///Start Sever
const app = new Koa()
const router = new Router();

//配置Session的中间件
app.keys = ['some secret hurr'];   /*cookie的签名*/
const koaSessionConfig = {
    key: 'lk_koa:session', /** 默认 */
    maxAge: 2 * 3600 * 1000,  /*  cookie的过期时间，单位 ms  */
    overwrite: true, /** (boolean) can overwrite or not (default true)  默认 */
    httpOnly: true, /**  true表示只有服务器端可以获取cookie */
    signed: true, /** 默认 签名 */
    rolling: true, /** 在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false） 【需要修改】 */
    renew: false, /** (boolean) renew session when session is nearly expired      【需要修改】*/
};
app.use(session(koaSessionConfig, app));

app.use(bodyParser()); // 确保使用 koa-bodyparser 中间件
app.use(cors()); // 使用 koa-cors 中间件

// router.post('/blacklake/chatBot/getAccessToken',async (ctx)=>{
//     ctx.body = "accessToken"
// })


//注册服务端路由和处理
router.get(serverConfig.config.getUserAccessTokenPath, getUserAccessToken)
router.get(serverConfig.config.getSignParametersPath, getSignParameters)
var port = process.env.PORT || serverConfig.config.apiPort;
app.use(routerApi.routes()).use(routerApi.allowedMethods());
app.use(router.routes()).use(router.allowedMethods());
app.listen(port, () => {
    console.log(`server is start, listening on port ${port}`);
})