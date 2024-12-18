import React, { useEffect, useState } from "react";
//components
import UserInfo from "../../components/userinfo";
import UseAPI from "../../components/useapi";
//
import {
  authorizeFeishu,
  handleJSAPIAccess,
  handleUserAuth,
  requestUserAccessToken,
} from "../../utils/auth_access_util";
import "./index.css";
import { getUserInfoStorage, setUserInfoStotage } from "../../utils/storage";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});

  const userInfoStorage = getUserInfoStorage();

  const params = new URLSearchParams(window.location.search);
  const openInBrowserValue = params.get("open_in_browser") === "true";
  const code = params.get("code") || "";
  console.log("code=====: ", code);

  useEffect(() => {
    console.log("useEffect======: ", openInBrowserValue, code);

    if (code) {
      console.log("useEffect====code==: ", code);
      //免登处理
      requestUserAccessToken(code, (userInfo) => {
        console.log("杰哥测试====handleUserAuth=：", userInfo);
        redirectToChatPage(userInfo);
      });
    } else if (!openInBrowserValue) {
      //鉴权处理
      handleJSAPIAccess((isSucces) => {
        console.log("handleJSAPIAccess OK: ", isSucces);
        //免登处理
        handleUserAuth((userInfo) => {
          console.log("杰哥测试====handleUserAuth=：", userInfo);
          redirectToChatPage(userInfo);
        });
      });
    }
  }, [openInBrowserValue, code]); // eslint-disable-line react-hooks/exhaustive-deps

  const redirectToChatPage = (userInfo: any) => {
    setUserInfo(userInfo);
    setUserInfoStotage(userInfo);
  };

  if (userInfoStorage) {
    navigate("/feishuApp/chatBot");
    return;
  }

  if (openInBrowserValue) {
    console.log("open_in_browser");
    authorizeFeishu();
    return;
  }

  return (
    <div className="home">
      <UserInfo userInfo={userInfo} />
      <UseAPI />
    </div>
  );
}
