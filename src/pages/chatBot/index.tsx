import React, { useEffect, useState } from "react";
import callModerChat from "../../services/chat.service";
import SEND_ICON from "../../assets/icons/send.svg";
import MODELSET_ICON from "../../assets/icons/model_set.svg";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "./index.css";
import "highlight.js/styles/github.css"; // 引入代码高亮的样式
import { EMODELS } from "../../constants";
import Popover from "../../basicComponents/Popover";
import ModelList from "./components/ModelList";
import { getUserInfoStorage } from "../../utils/storage";

// 配置 markdown-it 使用 highlight.js 进行代码高亮
const md = new MarkdownIt({
  breaks: true, // 启用硬换行
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ""; // 使用额外的默认转义
  },
});

// 扩展 MarkdownIt 渲染器以添加复制按钮
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  console.log("tokens=====", tokens);
  const token = tokens[idx];
  const code = token.content.trim();
  const lang = token.info.trim();
  const highlighted = options.highlight ? options.highlight(code, lang) : code;

  return `
    <div class="code-block">
      <pre><code class="hljs ${lang}">${highlighted}</code></pre>
      <div class="copy-button" data-code="${encodeURIComponent(
        code
      )}">复制</div>
    </div>
  `;
};

export default function ChatBotPage() {
  const [messages, setMessages] = useState<
    { sender: string; text: string; searchResults?: any[] }[]
  >([]);
  const [input, setInput] = useState("");
  const [botMessage, setBotMessage] = useState(""); // 用于存储当前的 bot 消息\

  const [curModel, setCurModel] = useState<String>(EMODELS.ERNIE_3_5);

  const userInfo = getUserInfoStorage();

  const handleSend = () => {
    if (input.trim() === "") return;

    const newMessage = { sender: "user", text: input };
    setMessages([...messages, newMessage]);

    callModerChat(input, (msg) => {
      if (msg.type === "DATA") {
        setBotMessage(msg.content); // 更新 bot 消息
      } else if (msg.type === "END") {
        console.log("Search results:", msg.searchResults);
        const botReply = {
          sender: "bot",
          text: botMessage + msg.content,
          searchResults: msg.searchResults || [],
        };

        setMessages((prevMessages) => [...prevMessages, botReply]);
        setBotMessage(""); // 清空当前的 bot 消息
      } else if (msg.type === "ERROR") {
        console.error("Error:", msg.content);
      } else {
        console.log(msg);
      }
    });

    setInput("");
  };
  return (
    <div className="flex flex-col h-screen bg-[#ebf1fd] p-6 max-w-[960px] mx-auto">
      <div className="text-2xl font-bold">Hi，欢迎来到 黑湖ChatGpt</div>
      <div className="mt-4">我是你的AI小助手：小黑</div>
      <div className="flex-1 overflow-y-auto p-4 mt-4 hide-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`max-w-[80%] text-left whitespace-pre-line relative shadow-[0 2px 8px 0 rgba(7, 12, 20, .04)] p-4 text-sm rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-500 text-white leading-[4px]"
                  : "bg-white text-[#151b26] leading-[1.2]"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: md.render(message.text),
                }}
              ></div>
              {message.sender === "bot" && message?.searchResults.length ? (
                <div>
                  {message?.searchResults.map((resultOrigin) => (
                    <a
                      key={resultOrigin.url}
                      href={resultOrigin.url}
                      target="_blank"
                      className="block text-blue-500 mt-2 hover:underline"
                    >
                      {resultOrigin.title}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            {message.sender === "user" && (
              <img
                src={userInfo.avatar_thumb}
                className="w-[40px] ml-2 object-cover rounded-[50%]"
              />
            )}
          </div>
        ))}
        {botMessage && (
          <div className="flex justify-start mb-4">
            <div
              className="max-w-[80%] text-left whitespace-pre-line relative shadow-[0 2px 8px 0 rgba(7, 12, 20, .04)] p-4 text-sm rounded-lg bg-white text-[#151b26] leading-[1.2]"
              dangerouslySetInnerHTML={{
                __html: md.render(botMessage),
              }}
            ></div>
          </div>
        )}
      </div>
      <div className="m-4 flex">
        <Popover content={<ModelList />}>
          <img
            className="w-[20px] h-[20px] cursor-pointer mr-3"
            src={MODELSET_ICON}
          />
        </Popover>

        <div className="text-xs bg-slate-200 opacity-45 flex items-center justify-center px-2 rounded text-[#0078e7]">
          {curModel}
        </div>
      </div>
      <div className="ml-4 bg-white flex relative rounded-lg">
        <textarea
          className="w-full p-2 border border-gray-300 rounded-lg min-h-[100px] pr-10 resize-none align-top"
          value={input}
          placeholder="输入想要问的问题~"
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <img
          src={SEND_ICON}
          className="w-[30px] h-[30px] absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={handleSend}
        />
      </div>
    </div>
  );
}
