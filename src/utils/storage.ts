import { IUserInfoStorage } from "../interfaces/storage.interface";


export function setUserInfo(userInfo: IUserInfoStorage) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

export function getUserInfo() {

}   