 
const axios = require('axios');
const Router = require('koa-router');
const {getAccessToken} =require('./baiduModer')

const AK = "PbN0DATzeJ41yR6gjkeAgcBH"
const SK = "UHcAr2yCbKIJnj492XXUZIKNMdEubSRA"

const router=new Router({prefix:'/blacklake/chatBot'})

router.post('/getAccessToken',async (ctx)=>{
    let accessToken = await getAccessToken()
    ctx.body = accessToken
})

module.exports=router