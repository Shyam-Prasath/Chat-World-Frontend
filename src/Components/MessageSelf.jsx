const MessageSelf = ({ message, file, time }) => {
return (
    <div className='MessageSelf'>
    <div className='yourside'>
        {message && <p className='your-message'>{message}</p>}

        {file && file.type === 'image' && (
            <img src={file.url} alt="uploaded" className='your-file' />
        )}
        {file && file.type === 'video' && (
            <video src={file.url} controls className='your-file' />
        )}
        {file && file.type === 'audio' && (
            <audio src={file.url} controls className='your-file' />
        )}
        {file && file.type !== 'image' && file.type !== 'video' && file.type !== 'audio' && (
            <a href={file.url} target="_blank" rel="noreferrer" className='your-file-link'>
                Download File
            </a>
        )}
        <p className='your-time'>{time}</p>
    </div>
    </div>
);
};

export default MessageSelf;
