import clientConfig from "../config/client_config";
import { getOrigin } from "../utils/auth_access_util";
import axios from "axios";

//千帆流式接口js调用demo
function callBaiduWorkshopSSE(url, access_token, body, onMessage) {
    body.stream = true;
    const decoder = new TextDecoder("utf-8");
    let buffer = '';
    let dataMsgBuffer = '';
    let completeMessage = ''; // 用于存储完整的回答

    const processMessage = (reader) => {
        reader.read().then(content => {
            buffer += decoder.decode(content.value, { stream: !content.done });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            lines.forEach(line => {
                if (line === "") { //读取到空行，一个数据块发送完成
                    const parsedData = JSON.parse(dataMsgBuffer);
                    completeMessage += parsedData.result; // 合并数据块
                    onMessage({
                        type: "DATA",
                        content: completeMessage // 返回当前的完整回答
                    });
                    dataMsgBuffer = "";
                    return;
                }
                let [type] = line.split(":", 1);
                let content = line.substring(type.length + 1);
                if (type === 'data') { //数据块没有收到空行之前放入buffer中
                    dataMsgBuffer += content.trim();
                } else if (type === '' && content != '') { //服务端发送的注释，用于保证链接不断开
                    onMessage({
                        type: "COMMENT",
                        content: content.trim()
                    });
                } else {
                    onMessage({
                        type: type,
                        content: content.trim()
                    })
                }
            })
            if (!content.done) {
                processMessage(reader);
            } else {
                onMessage({
                    type: "END",
                    content: completeMessage // 返回完整的回答
                })
            }
        })
    }
    fetch(`${url}?access_token=${access_token}`, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(body)
    })
        .then(response => response.body.getReader())
        .then(reader => processMessage(reader))
        .catch(error => onMessage({
            type: "ERROR",
            content: error
        }));
}

export default async function callModerChat(msg: string, onMessage: (msg: any) => void) {
    let url = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions"
    let access_token = await getAccessTokenApi();
    let body = {
        "messages": [
            {
                "role": "user",
                "content": msg
            }
        ]
    }

    callBaiduWorkshopSSE(url, access_token, body, onMessage);
}

export async function getAccessTokenApi() {
    let response = await axios.post(`${getOrigin(clientConfig.apiPort)}/blacklake/chatBot/getAccessToken`);
    console.log("getAccessTokenApi=====", response);
    return response.data;
}