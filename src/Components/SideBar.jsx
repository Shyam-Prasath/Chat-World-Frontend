import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LightModeIcon from '@mui/icons-material/LightMode';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggletheme } from '../features/themeslice';
import ConversationItem from './ConversationItem';

const SideBar = () => {
  const [conversation, setConversation] = useState([]);
  const UserNav = useNavigate();
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey.value);
  const [searchTerm, setSearchTerm] = useState(""); 

  // Get user data from localStorage
  const userData = localStorage.getItem('userdata')
    ? JSON.parse(localStorage.getItem('userdata'))
    : null;
  const token = userData?.token;

  // Ensure currentUser is the object with _id
  const currentUser = userData?.data || userData;

  useEffect(() => {
    if (!token) {
      UserNav('/');
    }
  }, [token, UserNav]);

  useEffect(() => {
    if (token) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      axios
        .get('https://chat-world-backend-9ihy.onrender.com/chat/', config)
        .then((response) => {
          setConversation(response.data);

          // Debug: See currentUser and conversation data
        })
        .catch((error) =>
          console.error('Error fetching conversation: ', error)
        );
    } else {
      console.error('Token not found or invalid in localStorage');
    }
  }, [token, currentUser]);


  const filteredConversations = conversation.filter((conv) => {
    let name = "";
    if (conv.isGroupChat) {
      name = conv.chatName || "";
    } else {
      const otherUser = conv.users?.find(
        (u) => u._id !== currentUser.user?._id
      );
      name = otherUser?.name || "";
    }
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });


  return (
    <div className="SideBar">
      <div className={`sb-header ${lightTheme ? 'light' : 'dark'}`}>
        <div>
          <IconButton className={`${lightTheme ? 'light' : 'dark'}`}>
            <AccountCircleIcon />
          </IconButton>
        </div>
        <div className="twond">
          <IconButton
            onClick={() => UserNav('user-present')}
            className={`${lightTheme ? 'light' : 'dark'}`}
          >
            <PersonAddIcon />
          </IconButton>
          <IconButton
            onClick={() => UserNav('group-present')}
            className={`${lightTheme ? 'light' : 'dark'}`}
          >
            <GroupAddIcon />
          </IconButton>
          <IconButton
            onClick={() => UserNav('create-group')}
            className={`${lightTheme ? 'light' : 'dark'}`}
          >
            <AddCircleIcon />
          </IconButton>
          <IconButton
            onClick={() => dispatch(toggletheme())}
            className={`${lightTheme ? 'light' : 'dark'}`}
          >
            {!lightTheme ? <LightModeIcon /> : <ModeNightIcon />}
          </IconButton>
        </div>
      </div>

      <div className={`sb-search ${lightTheme ? 'light' : 'dark'}`}>
        <div className={`search-button ${lightTheme ? 'light' : 'dark'}`}>
          <IconButton className={`${lightTheme ? 'light' : 'dark'}`}>
            <SearchIcon />
          </IconButton>
        </div>
        <input
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // ✅ Update state
          className={`sb-search-bar ${lightTheme ? 'light' : 'dark'}`}
        />
      </div>

      <div className={`sb-conversation ${lightTheme ? 'light' : 'dark'}`}>
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
              currentUser={currentUser.user}
            />
          ))
        ) : (
          <p style={{ padding: "10px", color: "#888" }}>No results found</p>
        )}
      </div>
    </div>
  );
};

export default SideBar;
