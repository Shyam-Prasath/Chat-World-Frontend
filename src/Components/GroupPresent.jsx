import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { IconButton } from '@mui/material';
import axios from 'axios';
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const GroupPresent = () => {
    const lightTheme = useSelector((state) => state.themeKey.value);
    const userData = JSON.parse(localStorage.getItem('userdata') || 'null');
    const token = userData?.token;

    const [groups, setGroups] = useState([]);
    const [searchTeam, setSearchTeam] = useState('');

    useEffect(() => {
        const fetchMyGroups = async () => {
            if (!token) return;

            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                // ✅ Call the backend that already filters by creatorId
                const response = await axios.get('https://chat-world-backend-9ihy.onrender.com/chat/fetchGroup', config);
                setGroups(response.data);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };

        fetchMyGroups();
    }, [token]);

    const handleAddUser = async (groupId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(
                'https://chat-world-backend-9ihy.onrender.com/chat/addSelfUser',
                { chatId: groupId, userId: userData._id },
                config
            );

            alert('Successfully joined the group!');
        } catch (error) {
            console.error('Error adding user to group:', error.message);
            alert('Failed to join the group. Please try again.');
        }
    };

    // ✅ Apply search filter
    const filteredGroups = groups.filter((group) =>
        group.chatName?.toLowerCase().includes(searchTeam.toLowerCase())
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ ease: "anticipate", duration: 0.8 }}
                style={{ flex: 1 }}
            >
                <div className="UserPresent-Container">
                    {/* Header */}
                    <div className={`up-header ${lightTheme ? '' : 'dark'}`}>
                        <div className={`header-align ${lightTheme ? '' : 'dark'}`}>
                            <IconButton className={`${lightTheme ? '' : 'dark'}`}>
                                <PersonOutlineIcon />
                            </IconButton>
                            <div className={`header-name ${lightTheme ? '' : 'dark'}`}>
                                My Created Groups
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className={`up-search ${lightTheme ? '' : 'dark'}`}>
                        <div className={`search-align ${lightTheme ? '' : 'dark'}`}>
                            <IconButton className={`${lightTheme ? '' : 'dark'}`}>
                                <ManageSearchIcon />
                            </IconButton>
                            <div className={`search-name ${lightTheme ? '' : 'dark'}`}>
                                <input
                                    placeholder="Enter The Group Name"
                                    className={`SearchBar ${lightTheme ? '' : 'dark'}`}
                                    value={searchTeam}
                                    onChange={(e) => setSearchTeam(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Group List */}
                    <div className="up-users">
                        {filteredGroups.map((group) => (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                key={group._id}
                                className={`user-available ${lightTheme ? '' : 'dark'}`}
                                onClick={() => handleAddUser(group._id)}
                            >
                                <div className="user-initial">
                                    {group.chatName?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div className="user-name">{group.chatName}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GroupPresent;
