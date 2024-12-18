import "./index.css";
import logo from "../../logo.svg";
import React from "react";

function UserInfo(props: any) {
  let userInfo = props.userInfo;
  if (!userInfo) {
    userInfo = {};
  }

  return (
    <div className="userinfo">
      <img className="avatar" src={userInfo.avatar_url || logo} alt="" />
      <span className="name">
        {userInfo.name && userInfo.name.length > 0 ? "Welcome to 飞书" : ""}
      </span>
    </div>
  );
}

export default UserInfo;
