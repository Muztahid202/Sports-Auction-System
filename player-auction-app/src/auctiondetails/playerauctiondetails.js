import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
// import 
import Collapsible from 'react-collapsible';
// import { Button } from 'primereact/button';


const PlayerAuctionDetails = ( ) => {
    const { id } = useParams(); // Extract auction ID from URL parameter
    const [auctionDetails, setAuctionDetails] = useState(null);
    const [bidmanagers, setBidmanagers] = useState([]);
    const [currentBidmanager, setCurrentBidmanager] = useState([]);
    const auctionId = window.location.pathname.split('/')[2];
    const playerId = window.location.pathname.split('/')[4];
    
    useEffect(() => {
        // Fetch auction details using the auction ID
        axios.get(`http://localhost:9002/auction/${auctionId}`)
            .then((res) => {
                setAuctionDetails(res.data);
                console.log(auctionDetails);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [id]);
    
    // console.log(bidManagerId);
    const navigate = useNavigate();
    console.log(auctionId);
    const handleNavigateToiPlayers = () => {
        navigate(`/auction/${auctionId}/player/${playerId}/iplayers`);
    };
    const handleNavigateToiTeams = () => {
        navigate(`/auction/${auctionId}/player/${playerId}/iteams`);
    };

    const handleNavigateToBiddingArena = () => {
        navigate(`/auction/${auctionId}/player/${playerId}/ibidding-arena`);
    };


    return (
        <div>
          <br></br>
          {/* <h2>Auction Details</h2> */}
          {auctionDetails ? (
            <>
              <h1>{auctionDetails.NAME}</h1>
              <p>Auction Type: {auctionDetails.TYPE}</p>
            </>
          ) : (
            <p>Loading auction details...</p>
          )}

          <hr />
          <div>
    
            <h2>Navigation</h2>
            <button onClick={handleNavigateToiPlayers}>Players</button>
            <button onClick={handleNavigateToiTeams}>Teams</button>

            <hr />

    
            <button onClick={handleNavigateToBiddingArena}>Bidding Arena</button>
          </div>
        </div>
      );

};

export default PlayerAuctionDetails;
