import CheckIcon from '@mui/icons-material/Check';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';
import { AnimatePresence, motion } from "motion/react";
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CreateGroups = () => {
    const [open, setOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const navigate = useNavigate();

    const userData = JSON.parse(localStorage.getItem('userdata') || 'null');
    const token = userData?.token;
    const lightTheme = useSelector((state) => state.themeKey.value);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const makeGroup = async () => {
        if (!groupName.trim()) {
            alert('Please enter a group name.');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // ✅ Backend automatically sets creatorId from req.user
            await axios.post(
                'https://chat-world-backend-9ihy.onrender.com/chat/createGroup',
                { name: groupName, users: [] },
                config
            );

            navigate('/app/group-present');
        } catch (error) {
            console.error('Error creating group:', error.message);
            alert('Failed to create group. Please try again.');
        } finally {
            setOpen(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ ease: "anticipate", duration: 0.8 }}
                style={{ flex: 1, marginTop: '14rem' }}
            >
                <div className="CreateGroup">
                    <div className={`ok ${lightTheme ? 'light' : 'dark'}`}>
                        <input
                            placeholder="Enter Group Name"
                            className={`group-type ${lightTheme ? 'light' : 'dark'}`}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <div className="ok-icon">
                            <IconButton
                                className={`${lightTheme ? 'light' : 'dark'}`}
                                onClick={handleClickOpen}
                            >
                                <CheckIcon />
                            </IconButton>
                        </div>
                    </div>
                </div>
            </motion.div>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Creating a Group?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure? You will become the group admin and can add users, 
                        but you cannot remove users once they are added.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Disagree</Button>
                    <Button onClick={makeGroup} autoFocus>Agree</Button>
                </DialogActions>
            </Dialog>
        </AnimatePresence>
    );
};

export default CreateGroups;
