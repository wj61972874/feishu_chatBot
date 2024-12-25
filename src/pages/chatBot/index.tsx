// import React, { useEffect, useState } from "react";
import callModerChat from "../../services/chat.service";
import MODELSET_ICON from "../../assets/icons/model_set.svg";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "./index.css";
import "highlight.js/styles/github.css"; // 引入代码高亮的样式
import { EMODELS } from "../../constants";
import { getUserInfoStorage } from "../../utils/storage";

import {
  Attachments,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  Welcome,
} from "@ant-design/x";
import { createStyles } from "antd-style";
import React, { useEffect, useState } from "react";

import {
  CloudUploadOutlined,
  CommentOutlined,
  EllipsisOutlined,
  FireOutlined,
  HeartOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReadOutlined,
  ShareAltOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { Badge, Button, Dropdown, type GetProp, MenuProps, Space } from "antd";

const renderTitle = (icon: React.ReactElement, title: string) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);

const defaultConversationsItems = [
  {
    key: "0",
    label: "What is Ant Design X?",
  },
];

const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      min-width: 1000px;
      height: 100vh;
      border-radius: ${token.borderRadius}px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      .ant-prompts {
        color: ${token.colorText};
      }
    `,
    menu: css`
      background: ${token.colorBgLayout}80;
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
    conversations: css`
      padding: 0 12px;
      flex: 1;
      overflow-y: auto;
    `,
    chat: css`
      height: 100%;
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${token.paddingLG}px;
      gap: 16px;
    `,
    messages: css`
      flex: 1;
    `,
    placeholder: css`
      padding-top: 32px;
    `,
    sender: css`
      box-shadow: ${token.boxShadow};
    `,
    logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
        display: inline-block;
      }

      span {
        display: inline-block;
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
    addBtn: css`
      background: #1677ff0f;
      border: 1px solid #1677ff34;
      width: calc(100% - 24px);
      margin: 0 12px 24px 12px;
    `,
  };
});

const placeholderPromptsItems: GetProp<typeof Prompts, "items"> = [
  {
    key: "1",
    label: renderTitle(
      <FireOutlined style={{ color: "#FF4D4F" }} />,
      "Hot Topics"
    ),
    description: "What are you interested in?",
    children: [
      {
        key: "1-1",
        description: `What's new in X?`,
      },
      {
        key: "1-2",
        description: `What's AGI?`,
      },
      {
        key: "1-3",
        description: `Where is the doc?`,
      },
    ],
  },
  {
    key: "2",
    label: renderTitle(
      <ReadOutlined style={{ color: "#1890FF" }} />,
      "Design Guide"
    ),
    description: "How to design a good product?",
    children: [
      {
        key: "2-1",
        icon: <HeartOutlined />,
        description: `Know the well`,
      },
      {
        key: "2-2",
        icon: <SmileOutlined />,
        description: `Set the AI role`,
      },
      {
        key: "2-3",
        icon: <CommentOutlined />,
        description: `Express the feeling`,
      },
    ],
  },
];

const senderPromptsItems: GetProp<typeof Prompts, "items"> = [
  {
    key: "1",
    description: "Hot Topics",
    icon: <FireOutlined style={{ color: "#FF4D4F" }} />,
  },
  {
    key: "2",
    description: "Design Guide",
    icon: <ReadOutlined style={{ color: "#1890FF" }} />,
  },
];

const roles: GetProp<typeof Bubble.List, "roles"> = {
  bot: {
    placement: "start",
    // typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: 16,
      },
    },
  },
  user: {
    placement: "end",
    variant: "shadow",
  },
};

const Independent: React.FC = () => {
  // ==================== Style ====================
  const { styles } = useStyle();

  const userInfo = getUserInfoStorage();

  const [curModel, setCurModel] = useState<string>(EMODELS.ERNIE_3_5);

  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = useState<boolean>(false);

  const [content, setContent] = useState<string>("");

  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const [conversationsItems, setConversationsItems] = React.useState(
    defaultConversationsItems
  );

  const [botMessage, setBotMessage] = useState(""); // 用于存储当前的 bot 消息\
  const [messages, setMessages] = useState<
    { role: string; content: string; searchResults?: any[] }[]
  >([]);

  const [activeKey, setActiveKey] = React.useState(
    defaultConversationsItems[0].key
  );

  const [attachedFiles, setAttachedFiles] = React.useState<
    GetProp<typeof Attachments, "items">
  >([]);

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
    const highlighted = options.highlight
      ? options.highlight(code, lang)
      : code;

    return `
      <div class="code-block">
        <pre><code class="hljs ${lang}">${highlighted}</code></pre>
        <div class="copy-button" data-code="${encodeURIComponent(
          code
        )}">复制</div>
      </div>
    `;
  };

  // ==================== Runtime ====================

  useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
    }
  }, [activeKey]);

  useEffect(() => {
    console.log("messages=======", messages);
  }, [messages]);

  // ==================== Event ====================
  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    setIsRequesting(true);

    const newMessage = { role: "user", content: nextContent };
    setMessages([...messages, newMessage]);

    callModerChat(nextContent, curModel, (msg) => {
      if (msg.type === "DATA") {
        setBotMessage(msg.content); // 更新 bot 消息
      } else if (msg.type === "END") {
        console.log("Search results:", msg.searchResults);
        const botReply = {
          role: "bot",
          content: botMessage + msg.content,
          searchResults: msg.searchResults || [],
        };

        setMessages((prevMessages) => [...prevMessages, botReply]);
        setBotMessage(""); // 清空当前的 bot 消息
        setIsRequesting(false);
      } else if (msg.type === "ERROR") {
        console.error("Error:", msg.content);
        setIsRequesting(false);
      } else {
        console.log(msg);
      }
    });

    setContent("");
  };

  const onPromptsItemClick: GetProp<typeof Prompts, "onItemClick"> = (info) => {
    onSubmit(info.data.description as string);
  };

  const onAddConversation = () => {
    setConversationsItems([
      ...conversationsItems,
      {
        key: `${conversationsItems.length}`,
        label: `New Conversation ${conversationsItems.length}`,
      },
    ]);
    setActiveKey(`${conversationsItems.length}`);
  };

  const onConversationClick: GetProp<typeof Conversations, "onActiveChange"> = (
    key
  ) => {
    setActiveKey(key);
  };

  const handleFileChange: GetProp<typeof Attachments, "onChange"> = (info) =>
    setAttachedFiles(info.fileList);

  // ==================== Nodes ====================
  const placeholderNode = (
    <Space direction="vertical" size={16} className="pt-8">
      <Welcome
        variant="borderless"
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="Hello, I'm Ant Design X"
        description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
        extra={
          <Space>
            <Button icon={<ShareAltOutlined />} />
            <Button icon={<EllipsisOutlined />} />
          </Space>
        }
      />
      <Prompts
        title="Do you want?"
        items={placeholderPromptsItems}
        styles={{
          list: {
            width: "100%",
          },
          item: {
            flex: 1,
          },
        }}
        onItemClick={onPromptsItemClick}
      />
    </Space>
  );

  const attachmentsNode = (
    <Badge dot={attachedFiles.length > 0 && !headerOpen}>
      <Button
        type="text"
        icon={<PaperClipOutlined />}
        onClick={() => setHeaderOpen(!headerOpen)}
      />
    </Badge>
  );

  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={headerOpen}
      onOpenChange={setHeaderOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={handleFileChange}
        placeholder={(type) =>
          type === "drop"
            ? { title: "Drop file here" }
            : {
                icon: <CloudUploadOutlined />,
                title: "Upload files",
                description: "Click or drag files to this area to upload",
              }
        }
      />
    </Sender.Header>
  );

  const logoNode = (
    <div className={styles.logo}>
      <img
        src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
        draggable={false}
        alt="logo"
      />
      <span>Ant Design X</span>

      <div className="text-[10px]">{curModel}</div>
    </div>
  );

  const modelItems: MenuProps["items"] = Object.values(EMODELS).map(((
    model
  ) => {
    return {
      label: (
        <span
          className="cursor-pointer"
          onClick={() => {
            setCurModel(model);
          }}
        >
          {model}
        </span>
      ),
      key: model,
    };
  }) as any);

  // ==================== Render =================
  return (
    <div
      // className="w-full min-w-[1000px] h-[722px] rounded-[16px] flex bg-[#f0f2f5] font-sans"
      className={styles.layout}
    >
      <div
        // className="w-[280px] h-full flex flex-col"
        className={styles.menu}
      >
        {/* 🌟 Logo */}
        {logoNode}
        {/* 🌟 添加会话 */}
        <Button
          onClick={onAddConversation}
          type="link"
          className={styles.addBtn}
          icon={<PlusOutlined />}
        >
          New Conversation
        </Button>
        {/* 🌟 会话管理 */}
        <Conversations
          items={conversationsItems}
          className={styles.conversations}
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </div>
      <div className={styles.chat}>
        {/* 🌟 消息列表 */}
        <div className="flex-1 overflow-y-auto mt-4 hide-scrollbar">
          {messages.length === 0 ? (
            placeholderNode
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div
                    className={`max-w-[80%] text-left whitespace-pre-line relative shadow-[0 2px 8px 0 rgba(7, 12, 20, .04)] p-4 text-sm rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-500 text-white leading-[4px]"
                        : "bg-white text-[#151b26] leading-[1.2] border-[1px] border-[#f0f0f0]"
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: md.render(message.content),
                      }}
                    ></div>
                    {message.role === "bot" && message?.searchResults.length ? (
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
                  {message.role === "user" && (
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
                    className="max-w-[80%] text-left whitespace-pre-line relative shadow-[0 2px 8px 0 rgba(7, 12, 20, .04)] p-4 text-sm rounded-lg bg-white text-[#151b26] leading-[1.2] border-[1px] border-[#f0f0f0]"
                    dangerouslySetInnerHTML={{
                      __html: md.render(botMessage),
                    }}
                  ></div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          {/*模型选择 */}
          {/* <ModelList /> */}
          <div className="flex items-center">
            <Dropdown menu={{ items: modelItems }} placement="top">
              <img
                className="w-[20px] h-[20px] cursor-pointer"
                src={MODELSET_ICON}
              />
            </Dropdown>
            <div className="mx-4 text-[12px]">{curModel}</div>
          </div>

          {/* 🌟 提示词 */}
          <Prompts
            items={senderPromptsItems}
            onItemClick={onPromptsItemClick}
          />
        </div>

        {/* 🌟 输入框 */}
        <Sender
          value={content}
          header={senderHeader}
          onSubmit={onSubmit}
          onChange={setContent}
          prefix={attachmentsNode}
          loading={isRequesting}
          className={styles.sender}
        />
      </div>
    </div>
  );
};

export default Independent;
