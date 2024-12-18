import { EStorageKey } from "../constants";
import { IUserInfoStorage } from "../interfaces/storage.interface";
import jsonParse from "./jsonParse";


export function setUserInfoStotage(userInfo: IUserInfoStorage) {
    localStorage.setItem(EStorageKey.FEISHU_APP_CHATBOT_USERINFO, JSON.stringify(userInfo));
}

export function getUserInfoStorage() {
    const userInfo = localStorage.getItem(EStorageKey.FEISHU_APP_CHATBOT_USERINFO) ?? ''
    if (userInfo !== 'undefined') {
        return jsonParse<IUserInfoStorage>(userInfo);
    } else {
        return undefined;
    }
}   