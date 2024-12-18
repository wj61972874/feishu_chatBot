import React from "react";
import "./index.css";

const showActionSheet = () => {
  window.tt.showActionSheet({
    itemList: ["选项1", "选项2", "选项3", "选项4"],
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`showActionSheet fail: ${JSON.stringify(res)}`);
    },
  });
};

const getSystemInfo = () => {
  window.tt.getSystemInfo({
    success(res) {
      window.tt.showModal({
        title: "系统信息",
        content: JSON.stringify(res),
        confirmText: "确定",
        cancelText: "",
        success(res) {
          console.log("showModal 调用成功", res);
        },
        fail(res) {
          console.log(`showModal fail: ${JSON.stringify(res)}`);
        },
        complete(res) {
          // console.log('showModal 调用结束', res.errMsg);
        },
      });
    },
    fail(res) {
      console.log(`getSystemInfo fail: ${JSON.stringify(res)}`);
    },
  });
};

const previewImage = () => {
  window.tt.previewImage({
    urls: [
      "https://sf3-scmcdn2-cn.feishucdn.com/ee/lark/open/web/static/app-banner.05b68b58.png",
      "https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/33e4ae2ff215314046c51ee1d3008d89_p1QpEy0jkK.png",
    ],
    current:
      "https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/33e4ae2ff215314046c51ee1d3008d89_p1QpEy0jkK.png",
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`previewImage fail: ${JSON.stringify(res)}`);
    },
  });
};

export default function UseAPI() {
  return (
    <div className="useapi">
      <div className="item_title">
        <h4>JSAPI使用示范</h4>
      </div>

      <div className="item_desc">
        <span className="desc_content">获取系统信息</span>
      </div>
      <button className="item_button" onClick={getSystemInfo}>
        JSAPI - getSystemInfo
      </button>

      <div className="item_desc">
        <span className="desc_content">显示操作菜单</span>
      </div>
      <button className="item_button" onClick={showActionSheet}>
        JSAPI - showActionSheet
      </button>

      <div className="item_desc">
        <span className="desc_content">图片预览</span>
      </div>
      <button className="item_button" onClick={previewImage}>
        JSAPI - previewImage
      </button>
    </div>
  );
}
