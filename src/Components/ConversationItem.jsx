import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ConversationItem = ({ conversation }) => {
  const navigate = useNavigate();
  const lightTheme = useSelector((state) => state.themeKey.value);
  const [lastMessage, setLastMessage] = useState("Loading...");

  // Current logged-in user
  const storedData = JSON.parse(localStorage.getItem("userdata"));
  const currentUser = storedData?.user;
  const token = storedData?.token;

  // Determine chat name
  const chatName = conversation.isGroupChat
    ? conversation.chatName
    : conversation.users?.find((u) => u._id !== currentUser?._id)?.name || "Unknown";

  if (chatName === "Unknown") return null;

  useEffect(() => {
    const fetchLastMessage = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        let lastMsgData;

        if (conversation.isGroupChat) {
          lastMsgData = conversation.latestMessage;
        } else {
          const chatId = conversation._id;
          const res = await axios.get(`https://chat-world-backend-9ihy.onrender.com/message/last/${chatId}`, config);
          lastMsgData = res.data;
        }

        setLastMessage(lastMsgData?.content || "No previous Message");
      } catch (err) {
        console.error("Error fetching last message:", err);
        setLastMessage("No previous Message");
      }
    };

    fetchLastMessage();
  }, [conversation, token]);

  return (
    <div
      className="conversation-container"
      onClick={() =>
        navigate(`/app/chat-area/${conversation._id}`, { state: { chatName } })
      }
    >
      <div className="conversation-item">
        <div className="cc-logo">{chatName?.[0]?.toUpperCase() || "?"}</div>
        <div className="cc-name" style={{ color: lightTheme ? "" : "white", fontSize: "20px" }}>
          {chatName}
        </div>
        <div
          className="cc-message"
          style={{ fontSize: "18px", fontWeight: 500, color: lightTheme ? "#555" : "#ddd" }}
        >
          {lastMessage}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
