import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { IconButton } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MessageOthers from './MessageOthers';
import MessageSelf from './MessageSelf';

const ChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const storedData = JSON.parse(localStorage.getItem("userdata"));
  const currentUser = storedData?.user;
  const token = storedData?.token;

  const { chatId } = useParams();
  const location = useLocation();
  const chatName = location.state?.chatName || "Unknown";
  const lightTheme = useSelector((state) => state.themeKey.value);
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);

  // Initialize socket
  useEffect(() => {
    if (!token) return;
    const newSocket = io("https://chat-world-backend-9ihy.onrender.com", { query: { token } });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [token]);

  // Fetch messages
  useEffect(() => {
    if (!chatId) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios
      .get(`https://chat-world-backend-9ihy.onrender.com/message/${chatId}`, config)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, [chatId, token]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", (msg) => {
      if (msg.chat.toString() === chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("newMessage");
  }, [socket, chatId]);

  const sendMessage = async () => {
    if (!messageContent.trim() && !uploadedFile) return;

    let fileData = null;
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      try {
        const res = await axios.post("https://chat-world-backend-9ihy.onrender.com/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fileData = { url: res.data.url, type: res.data.type };
      } catch (err) {
        console.error("File upload error:", err);
        return;
      }
    }

    socket.emit("sendMessage", {
      content: messageContent || "",
      chatId,
      sender: { _id: currentUser._id, name: currentUser.name },
      file: fileData,
    });

    setMessageContent("");
    setUploadedFile(null);
    document.getElementById("fileUpload").value = "";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    const timeStr = `${hour12}:${minutes} ${ampm}`;

    if (isToday) return timeStr;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${timeStr}`;
  };

  const lastMessageTime = messages.length ? messages[messages.length - 1].createdAt : null;

  const startVideoCall = () => {
    navigate("/video-call", { state: { chatName } });
  };

  return (
    <div className="ChatArea">
      <div className="Chat-Container">
        {/* Header */}
        <div className={`Chat-Header ${lightTheme ? "" : "dark"}`}>
          <div className="chat-member">
            <div
              className="chat-icon"
              style={{
                color: lightTheme ? "" : "white",
                backgroundColor: lightTheme ? "" : "rgba(128,128,128,0.267)",
              }}
            >
              {chatName[0]}
            </div>
            <div className="chater">
              <div className={`chat-name ${lightTheme ? "" : "dark"}`}>{chatName}</div>
              <div className={`chat-last-message-time ${lightTheme ? "" : "dark"}`}>
                Last message: {lastMessageTime ? formatTime(lastMessageTime) : "No messages yet"}
              </div>
            </div>
          </div>

          <div className="chat-actions">
            <IconButton className={`${lightTheme ? "" : "dark"}`} onClick={startVideoCall}>
              <VideoCallIcon />
            </IconButton>
            <IconButton className={`${lightTheme ? "" : "dark"}`} onClick={() => console.log("Delete chat")}>
              <DeleteIcon />
            </IconButton>
          </div>
        </div>

        {/* Messages */}
        <div className={`Message-Body ${lightTheme ? "" : "dark"}`}>
          {messages.map((msg, idx) => {
            const isSelf = msg.sender?._id === currentUser._id;
            return isSelf ? (
              <MessageSelf key={msg._id || idx} message={msg.content} file={msg.file} time={formatTime(msg.createdAt)} />
            ) : (
              <MessageOthers key={msg._id || idx} name={msg.sender?.name} message={msg.content} file={msg.file} time={formatTime(msg.createdAt)} />
            );
          })}
        </div>

        {/* Input */}
        <div className={`Text-Input ${lightTheme ? "" : "dark"}`}>
          <input
            type="file"
            id="fileUpload"
            style={{ display: "none" }}
            onChange={(e) => setUploadedFile(e.target.files[0])}
            accept="*"
          />
          <label htmlFor="fileUpload" style={{ cursor: "pointer" }}>
            <AddIcon style={{ color: lightTheme ? "black" : "white", fontSize: 28 }} />
          </label>

          <input
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type Your Message"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="type-message"
            style={{ backgroundColor: lightTheme ? "transparent" : "rgba(128,128,128,0.267)" }}
          />

          <IconButton onClick={sendMessage}>
            <SendIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
