import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
// import css from './home.css';
import './css/home.css';
// import axios from 'axios';

const Home = () => {
return (
    <div className="home">
        <h1>Home</h1>
        <div className="home-container">
        <div className="home-right">
                <img src="https://d5aq5zygke863.cloudfront.net/product/images/PlayerAuctions_Logo.png" height={200}/>
            </div>
            <div className="home-left">
                <h2>Welcome to Player Auction System</h2>
                <p>Player Auction System is a platform where you can buy and sell players for your team. 
                    You can also create your own auction. 
                </p>
                <Link to="/login"> <button className="home-login">Login</button></Link>
                <Link to="/register"><button className="home-register">Register</button></Link>
            </div>
            
        </div>
    </div>
);
}

export default Home;