# Chat-World

**Chat-World** is a real-time chat application built with React, Redux, Vite, and Node.js. It supports 1-to-1 and group chats, file sharing, video calls via WebRTC, and blockchain-based authentication using MetaMask.

---

## 🚀 Features

- User authentication (JWT + MetaMask wallet login)
- 1-to-1 chats and group chats
- Real-time messaging with **Socket.IO**
- File uploads
- Last message preview in conversation list
- Video call support
- Light and dark themes
- Responsive UI

---

## 🛠 Tech Stack

**Frontend:**
- React + Vite
- Redux (state management)
- Material-UI (components)
- Axios (API requests)
- Socket.IO client
- Tailwind CSS (styling)
- **MetaMask / Web3 authentication**

**Backend:**
- Node.js + Express
- MongoDB (database)
- Mongoose (ORM)
- Socket.IO server
- JWT authentication
- Multer (file uploads)
- Blockchain wallet verification

---

## 📦 Project Structure

### Frontend
```
Chat-World-Frontend/
├─ src/
│  ├─ components/
│  │  ├─ auth/            # Sign-in / Sign-up forms, MetaMask login , ChatArea, MessageSelf, MessageOthers,Layouts, common components
│  ├─ hooks/              # Custom React hooks (e.g., useMetaMask)
│  ├─ lib/                # Utility functions
│  ├─ pages/              # App pages (ChatArea, Dashboard, etc.)
│  └─ App.jsx             # App entry
└─ package.json
```

### Backend
```

Chat-World-Backend/
├─ controller/            # Message, user, and wallet controllers
├─ middleware/            # Authentication + blockchain verification
├─ model/                 # Mongoose models (User, Chat, Message)
├─ routes/                # API routes
├─ server.js              # Express app entry
└─ package.json

````

---

## ⚡ Installation

### Backend
```bash
git clone https://github.com/Shyam-Prasath/Chat-World-Backend.git
cd Chat-World-Backend
npm install
npm run dev
````

### Frontend

```bash
git clone https://github.com/Shyam-Prasath/Chat-World-Frontend.git
cd Chat-World-Frontend
npm install
npm run dev
```

**Note:** Update backend URL in frontend `.env` for production deployment:

```
VITE_BACKEND_URL=https://your-backend-domain.com
```

---

## 🔑 Environment Variables

### Backend (`.env`)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend (`.env`)

```
VITE_BACKEND_URL=http://localhost:5000
```

---

## 📡 Running Locally

1. Start backend server (`npm run dev`) → runs on port 5000
2. Start frontend server (`npm run dev`) → runs on port 5173
3. Open browser at `http://localhost:5173`
4. Connect MetaMask wallet to authenticate

---

## 📄 API Endpoints

* `POST /api/user/login` → User login (email/password or MetaMask signature)
* `POST /api/user/register` → User registration
* `GET /api/message/:chatId` → Get all messages in a chat
* `POST /api/message/` → Send a new message
* `GET /api/message/last/:chatId` → Get last message of a chat

---

## 🔗 Blockchain Authentication

* Users can login/register using their **Ethereum wallet (MetaMask)**.
* The backend verifies wallet signatures to authenticate users without a password.
* Compatible with web3-enabled browsers and wallets.

---

## 💡 Notes

* Ensure **MongoDB** is running and the `.env` variables are set.
* Socket.IO is used for real-time messaging and video call events.
* File uploads are handled with **Multer**.
* Blockchain authentication is optional but provides a passwordless login method.
