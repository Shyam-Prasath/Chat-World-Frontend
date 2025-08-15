import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { IconButton } from '@mui/material';
import axios from 'axios';
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Tag from "./Tag";

const UserPresent = (props) => {
    const navigate = useNavigate();
    const lightTheme = useSelector((state) => state.themeKey.value);
    const [user, setUser] = useState([]);
    const [data, setData] = useState([]);
    const [searchquery, setSearchquery] = useState('');
    const [userStatus, setUserStatus] = useState({ message: '', severity: '' });

    const token = localStorage.getItem('userdata')
        ? JSON.parse(localStorage.getItem('userdata')).token
        : null;

    const headers = {
        Authorization: `Bearer ${token}`
    };

    useEffect(() => {
        if (!token) {
            navigate('/');
        }
    }, [navigate, token]);

    useEffect(() => {
        if (!token) return;
        const fetchData = async () => {
            try {
                const response = await axios.get('https://chat-world-backend-9ihy.onrender.com/user/fetchUser', { headers });
                setData(response.data);
                setUser(response.data);
                setUserStatus({ message: 'Success In Extraction Of User Status', severity: 'success' });
            } catch (err) {
                setUserStatus({ message: `Error ${err}`, severity: 'error' });
            }
        };
        fetchData();
    }, [token]);

    const filteredUsers = user.filter((u) =>
        u.name.toLowerCase().includes(searchquery.toLowerCase())
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ ease: "anticipate", duration: "0.8" }}
                style={{ flex: 1 }}
            >
                <div className={`UserPresent-Container`}>
                    <div className={`up-header ${lightTheme ? '' : 'dark'}`}>
                        <div className={`header-align ${lightTheme ? '' : 'dark'}`}>
                            <IconButton className={`${lightTheme ? '' : 'dark'}`}>
                                <PersonOutlineIcon />
                            </IconButton>
                            <div className={`header-name ${lightTheme ? '' : 'dark'}`}>
                                Online Users
                            </div>
                        </div>
                    </div>
                    <div className={`up-search ${lightTheme ? '' : 'dark'}`}>
                        <div className={`search-align ${lightTheme ? '' : 'dark'}`}>
                            <IconButton className={`${lightTheme ? '' : 'dark'}`}>
                                <ManageSearchIcon />
                            </IconButton>
                            <div className={`search-name ${lightTheme ? '' : 'dark'}`}>
                                <input
                                    placeholder='Enter The User Name'
                                    className={`SearchBar ${lightTheme ? '' : 'dark'}`}
                                    value={searchquery}
                                    onChange={(e) => setSearchquery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='up-users'>
                        {filteredUsers.map((users) => (
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.8 }}
                                key={users._id}
                                className={`user-available ${lightTheme ? '' : 'dark'}`}
                                onClick={() => {
                                    axios.post(
                                        'https://chat-world-backend-9ihy.onrender.com/chat/',
                                        { userId: users._id },
                                        { headers }
                                    )
                                        .then(response => {
                                            console.log('Chat started:', response.data);
                                            // Navigate to chat page with ID and name
                                            navigate(`/app/chat-area/${response.data._id}`, {
                                                state: { chatName: users.name }
                                            });
                                        })
                                        .catch(err => {
                                            console.error('Error Starting chat: ', err);
                                        });
                                }}
                            >
                                <div className='user-initial'>{users.name[0].toUpperCase()}</div>
                                <div className='user-name'>{users.name}</div>
                            </motion.div>
                        ))}
                        <Tag message={userStatus.message} severity={userStatus.severity} />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UserPresent;
