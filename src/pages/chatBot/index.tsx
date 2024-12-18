import React, { useEffect, useState } from "react";
import callModerChat from "../../services/chat.service";

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "./index.css";
import "highlight.js/styles/github.css"; // 引入代码高亮的样式

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
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [botMessage, setBotMessage] = useState(""); // 用于存储当前的 bot 消息

  const handleSend = () => {
    if (input.trim() === "") return;

    const newMessage = { sender: "user", text: input };
    setMessages([...messages, newMessage]);

    callModerChat(input, (msg) => {
      if (msg.type === "DATA") {
        setBotMessage(msg.content); // 更新 bot 消息
      } else if (msg.type === "END") {
        const botReply = { sender: "bot", text: botMessage + msg.content };
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
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
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
                  : "bg-white text-[#151b26] leading-normal"
              }`}
              dangerouslySetInnerHTML={{
                __html: md.render(message.text),
              }}
            ></div>
          </div>
        ))}
        {botMessage && (
          <div className="flex justify-start mb-4">
            <div
              className="max-w-[80%] text-left whitespace-pre-line relative shadow-[0 2px 8px 0 rgba(7, 12, 20, .04)] p-4 text-sm rounded-lg bg-white text-[#151b26] leading-normal"
              dangerouslySetInnerHTML={{
                __html: md.render(botMessage),
              }}
            ></div>
          </div>
        )}
      </div>
      <div className="p-4 bg-white flex">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
          onClick={handleSend}
        >
          发送
        </button>
      </div>
    </div>
  );
}
