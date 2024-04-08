import React, { useState } from 'react';
import './App.css';
import Home from './home'
import Homepage from './homepage/homepage';
import Login from './login/login';
import Register from './register/register';
import AuctionDetails from './auctiondetails/auctiondetails';
import Players from './players/players'; // Import your Players component
import Teams from './teams/teams'; // Import your Teams component
import BiddingArena from './biddingarena/biddingarena'; // Import your BiddingArena component
import TeamLogin from './teamlogin/teamlogin'; // Import your TeamLogin component
import PlayerLogin from './playerlogin/playerlogin'; // Import your PlayerLogin component
import BidManagerLogin from './bidmanagerlogin/bidmanagerlogin'; // Import your BidManagerLogin component
// import BiddingArena from './biddingarena/biddingarena';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TeamAuctionDetails from './auctiondetails/teamauctiondetails';
import IPlayers from './players/iPlayers';
import ITeams from './teams/iteams';
import BidManagerAuctionDetails from './auctiondetails/bidmanagerauctiondetails';
import PlayerAuctionDetails from './auctiondetails/playerauctiondetails';
import ManageBid from './biddingarena/managebid';
import IBiddingArena from './biddingarena/ibiddingarena';

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [auctionID, setAuctionID] = useState(null);

  return (
    <div className="App">
      <Router>
        <Routes>
          //when path is / then render the basic component
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUserInfo={setUserInfo} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/homepage" element={<Homepage userInfo={userInfo} />} />
          <Route path="/auction/:id" element={<AuctionDetails />}/>
            <Route path="/auction/:id/players" element={<Players />} />
            <Route path="/auction/:id/teams" element={<Teams />} />
            <Route path="/auction/:id/bidding-arena" element={<BiddingArena />} />
            <Route path="/team/:id" element={<TeamLogin />} />
            <Route path="/player/:id" element={<PlayerLogin />} />
            <Route path="/bidmanager/:id" element={<BidManagerLogin />} />
            <Route path = "/auction/:id/bidding-arena" element={<BiddingArena />} />
            <Route path = "/team/:id/auction/:aucttionId/" element={<TeamAuctionDetails />} />
            <Route path = "/auction/:auctionId/team/:teamId/bidding-arena" element={<BiddingArena />} />
            <Route path = "/auction/:id/iplayers" element={<IPlayers />} />
            <Route path = "/auction/:id/iteams" element={<ITeams />} />
            <Route path = "/bidmanager/:id/auction/:auctionId" element={<BidManagerAuctionDetails />} />
            <Route path = "/auction/:id/bidmanager/:bidManagerId/managebid" element={<ManageBid />} />
            <Route path = "/auction/:auctionId/player/:playerId/ibidding-arena" element={<IBiddingArena />} />
            <Route path = "/auction/:auctionId/player/:playerId" element={<PlayerAuctionDetails />} />
            <Route path = "/auction/:auctionId/player/:playerId/iplayers" element={<IPlayers />} />
            <Route path = "/auction/:auctionId/player/:playerId/iteams" element={<ITeams />} />


            {/* <Route path = "/auction/:auctionId/player/:playerId/managebid" element={<ManageBid />} /> */}

          {/* </Route> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
