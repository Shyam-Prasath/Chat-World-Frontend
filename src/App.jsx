import { useSelector } from 'react-redux'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import ChatArea from './Components/ChatArea'
import CreateGroups from './Components/CreateGroups'
import GroupPresent from './Components/GroupPresent'
import LoginPage from './Components/LoginPage'
import MainComponent from './Components/MainComponent'
import OpenPage from './Components/OpenPage'
import RegisterPage from './Components/RegisterPage'
import UserPresent from './Components/UserPresent'
import VideoCall from './Components/VideoCall'

const App = () => {
  const lightTheme = useSelector((state) => state.themeKey.value); // Accessing the correct value from Redux state
  return (
    <div className={`App ${lightTheme ? '':'dark'}`}>
      <Routes>
        <Route path='/' element={<LoginPage/>}></Route>
        <Route path='register' element={<RegisterPage/>}></Route>
        <Route path='app' element={<MainComponent/>}>
            <Route path='create-group' element={<CreateGroups/>}></Route>
            <Route path='chat-area/:chatId' element={<ChatArea/>}></Route>
            <Route path='user-present' element={<UserPresent/>}></Route>
            <Route path='group-present' element={<GroupPresent/>}></Route>
            <Route path='open-page' element={<OpenPage/>}></Route>
        </Route>
        <Route path="video-call" element={<VideoCall />} /> 
      </Routes>
    </div>
  )
}

export default App