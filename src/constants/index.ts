
export enum EStorageKey {
    FEISHU_APP_CHATBOT_USERINFO = 'FEISHU_APP_CHATBOT_USERINFO',
}

export enum EMODELS {
    // ERNIE_4_0 = 'ERNIE-4.0-8K',
    ERNIE_3_5 = 'ERNIE-3.5-8K',
    ERNIE_SPEED = 'ERNIE-Speed-8K',
    ERNIE_TINY = 'ERNIE-Tiny-8K',
    Yi_34B = "Yi-34B",
    Llama_2_7B_CHAT = "Llama-2-7b-chat"
}



export const ModelURLMap = {
    [EMODELS.ERNIE_3_5]: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions",
    [EMODELS.ERNIE_SPEED]: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie_speed",
    [EMODELS.ERNIE_TINY]: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-tiny-8k",
    [EMODELS.Yi_34B]: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/yi_34b_chat",
    [EMODELS.Llama_2_7B_CHAT]: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/llama_2_7b",
}