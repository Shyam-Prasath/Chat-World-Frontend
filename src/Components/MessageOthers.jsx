const MessageOthers = ({ name, message, file, time }) => {
return (
    <div className='MessageOthers'>
    <p className='Message-icon'>{name?.[0]?.toUpperCase() || '?'}</p>
    <div className='Message-Other'>
        <p className='Message-name'>{name}</p>

        {message && <p className='Message-info'>{message}</p>}

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


        <p className='Message-time'>{time}</p>
      </div>
    </div>
);
};

export default MessageOthers;
