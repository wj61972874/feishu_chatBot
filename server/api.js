 
const axios = require('axios');
const Router = require('koa-router');
const {getAccessToken} =require('./baiduModer')
const {EMODELS,
    ModelURLMap} =require('./constant')

const AK = "PbN0DATzeJ41yR6gjkeAgcBH"
const SK = "UHcAr2yCbKIJnj492XXUZIKNMdEubSRA"

const router=new Router({prefix:'/blacklake/chatBot'})

router.post('/getAccessToken',async (ctx)=>{
    let accessToken = await getAccessToken()
    ctx.body = accessToken
})



router.post('/callModerChat', async (ctx) => {
    const { msg,curModel } = ctx.request.body;
    const accessToken = await getAccessToken();
    const url =ModelURLMap[curModel] || "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions";
    const body = {
        "enable_trace": true,
        "stream": true,
        "messages": [
            {
                "role": "user",
                "content": msg
            }
        ]
    };

    try {
        const response = await axios.post(`${url}?access_token=${accessToken}`, body, {
            headers: {
                "Content-Type": "application/json"
            },
            responseType: 'stream'
        });

        ctx.status = response.status;
        ctx.set(response.headers);
        ctx.body = response.data;
    } catch (error) {
        ctx.status = error.response ? error.response.status : 500;
        ctx.body = error.response ? error.response.data : 'Internal Server Error';
    }
});

module.exports=router