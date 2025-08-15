import React from 'react';
import { useSelector } from 'react-redux';
import LoginImage from '../Images/Login-image.png';
const OpenPage = () => {
  const lightTheme = useSelector((state) => state.themeKey.value); // Accessing the correct value from Redux state
  const user=JSON.parse(localStorage.getItem('userdata'))
  return (
    <div className={`OpenPage`} style={{backgroundColor:lightTheme ? '':'rgba(0, 0, 0, 0.899)'}}>
        <div className='openpage-contanier'>
            <img src={LoginImage} alt='Login-img' className='Login-img'></img>
            <p className='intro' style={{color:lightTheme ? '':'whitesmoke'}}>Hello Mr/Mrs  {user.name}</p>
            <p className='intro' style={{color:lightTheme ? '':'whitesmoke'}}>Welcome to CHAT WORLD </p>
        </div>
    </div>
  )
}

export default OpenPage