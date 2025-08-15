import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
const MainComponent = () => {
    return (
        /*<div className='MainComponent'>
            <SideBar></SideBar>
            <UserPresent></UserPresent>
        </div>*/
    <div className={`MainComponent`}>
        <SideBar></SideBar>
        <Outlet></Outlet>
    </div>
    )
}

export default MainComponent