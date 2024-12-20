import clientConfig from "../config/client_config";
import { getOrigin } from "../utils/auth_access_util";

export default async function callModerChat(msg: string, onMessage: (msg: any) => void) {
    try {
        const response = await fetch(`${getOrigin(clientConfig.apiPort)}/blacklake/chatBot/callModerChat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ msg })
        });

        if (!response.body) {
            throw new Error('ReadableStream not yet supported in this browser.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = '';
        let dataMsgBuffer = '';
        let completeMessage = ''; // 用于存储完整的回答
        let searchResult = []; // 用于存储完整的回答

        const processMessage = async () => {
            const { done, value } = await reader.read();
            if (done) {
                // 使用 Set 去重
                const uniqueSearchResults = [];
                const seenIndexes = new Set();
                for (const item of searchResult) {
                    if (!seenIndexes.has(item.index)) {
                        seenIndexes.add(item.index);
                        uniqueSearchResults.push(item);
                    }
                }

                onMessage({
                    type: "END",
                    content: completeMessage, // 返回完整的回答
                    searchResults: uniqueSearchResults
                });
                return;
            }

            buffer += decoder.decode(value, { stream: !done });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            lines.forEach(line => {
                // console.log("line=====", line);
                if (line === "") { //读取到空行，一个数据块发送完成
                    const parsedData = JSON.parse(dataMsgBuffer);
                    completeMessage += parsedData.result; // 合并数据块
                    if (parsedData.search_info.search_results) {
                        searchResult = searchResult.concat(parsedData.search_info.search_results);
                    }

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
                    });
                }
            });

            processMessage();
        };

        processMessage();
    } catch (error) {
        onMessage({
            type: "ERROR",
            content: error.message
        });
    }
}

// import clientConfig from "../config/client_config";
// import { getOrigin } from "../utils/auth_access_util";
// import axios from "axios";

// let access_token;

// //千帆流式接口js调用demo
// function callBaiduWorkshopSSE(url, access_token, body, onMessage) {
//     body.stream = true;
//     const decoder = new TextDecoder("utf-8");
//     let buffer = '';
//     let dataMsgBuffer = '';
//     let completeMessage = ''; // 用于存储完整的回答
//     let searchResult = []; // 用于存储完整的回答

//     const processMessage = (reader) => {
//         reader.read().then(content => {
//             buffer += decoder.decode(content.value, { stream: !content.done });
//             const lines = buffer.split('\n');
//             buffer = lines.pop();
//             lines.forEach(line => {
//                 if (line === "") { //读取到空行，一个数据块发送完成
//                     const parsedData = JSON.parse(dataMsgBuffer);
//                     completeMessage += parsedData.result; // 合并数据块
//                     if (parsedData.search_info.search_results) {
//                         searchResult = searchResult.concat(parsedData.search_info.search_results);
//                     }

//                     onMessage({
//                         type: "DATA",
//                         content: completeMessage // 返回当前的完整回答
//                     });
//                     dataMsgBuffer = "";
//                     return;
//                 }
//                 let [type] = line.split(":", 1);
//                 let content = line.substring(type.length + 1);
//                 if (type === 'data') { //数据块没有收到空行之前放入buffer中
//                     dataMsgBuffer += content.trim();
//                 } else if (type === '' && content != '') { //服务端发送的注释，用于保证链接不断开
//                     onMessage({
//                         type: "COMMENT",
//                         content: content.trim()
//                     });
//                 } else {
//                     onMessage({
//                         type: type,
//                         content: content.trim()
//                     })
//                 }
//             })
//             if (!content.done) {
//                 processMessage(reader);
//             } else {
//                 // 使用 Set 去重
//                 const uniqueSearchResults = [];
//                 const seenIndexes = new Set();
//                 for (const item of searchResult) {
//                     if (!seenIndexes.has(item.index)) {
//                         seenIndexes.add(item.index);
//                         uniqueSearchResults.push(item);
//                     }
//                 }

//                 onMessage({
//                     type: "END",
//                     content: completeMessage, // 返回完整的回答
//                     searchResults: uniqueSearchResults
//                 })
//             }
//         })
//     }
//     fetch(`${url}?access_token=${access_token}`, {
//         headers: {
//             "Content-Type": "application/json"
//         },
//         method: "POST",
//         body: JSON.stringify(body)
//     })
//         .then(response => response.body.getReader())
//         .then(reader => processMessage(reader))
//         .catch(error => onMessage({
//             type: "ERROR",
//             content: error
//         }));
// }

// export default async function callModerChat(msg: string, onMessage: (msg: any) => void) {
//     let url = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions"
//     access_token = access_token || await getAccessTokenApi();
//     let body = {
//         "enable_trace": true,
//         "messages": [
//             {
//                 "role": "user",
//                 "content": msg
//             }
//         ]
//     }

//     callBaiduWorkshopSSE(url, access_token, body, onMessage);
// }

// export async function getAccessTokenApi() {
//     let response = await axios.post(`${getOrigin(clientConfig.apiPort)}/blacklake/chatBot/getAccessToken`);
//     console.log("getAccessTokenApi=====", response);
//     return response.data;
// }