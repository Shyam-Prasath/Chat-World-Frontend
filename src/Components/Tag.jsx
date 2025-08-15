import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import React from 'react';

export default function Tag({ message, severity , uniqueKey }) {
    const [open, setOpen] = React.useState(false);

    // Open the Snackbar whenever there's a new message
    React.useEffect(() => {
        if (uniqueKey) {
            setOpen(true);
        }
    }, [uniqueKey]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert
                onClose={handleClose}
                severity={severity}
                variant="filled"
                sx={{
                    width: '100%',
                    backgroundColor: severity === 'success' ? 'green' : 'red',
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}
