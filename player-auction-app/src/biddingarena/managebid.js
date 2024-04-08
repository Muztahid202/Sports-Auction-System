import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

import axios from "axios";
import { json } from "react-router-dom";

const ManageBid = () => {
    const [players, setPlayers] = useState(null);
    const [currentBid, setCurrentBid] = useState(null);
    // const auctionId = window.location.pathname.split('/')[2];
    const [auctionId, setAuctionId] = useState(parseInt(window.location.pathname.split('/')[2], 10));
   const [bidFlag, setBidFlag] = useState(false);
    const bidManagerId = window.location.pathname.split('/')[4];
    // const auctionId = window.location.pathname.split('/')[2];

    useEffect(() => {
        // Fetch players data
        axios
            .get(`http://localhost:9002/SendToBidZone/${auctionId}`)
            .then((res) => {
                setPlayers(res.data);
                console.log(players);

            })
            .catch((err) => {
                console.error(err);
            });
    }, []);
    useEffect(() => {
        axios.get(`http://localhost:9002/currentBiddingPlayers/${auctionId}`)
            .then((res) => {
                console.log(res.data);
                setCurrentBid(res.data);

                // setAuctionId(res.data[0].AUCTION_ID);
                if(res.data.length>0)
                setAuctionId(res.data[0].AUCTION_ID);
                console.log(auctionId);
            }
            )
            .catch((err) => {
                console.error(err);
            });
    }, []);
    useEffect(() => {
        axios.get(`http://localhost:9002/countBid/${auctionId}`)
            .then((res) => {
                // console.log(`bidFlag: ${json.stringify(res.data)}`);
                console.log(res.data);
                const current = res.data.hasPlayersInBid;
                console.log(current);
                setBidFlag(current);
                // setBidFlag(res.data.hasPlay);
                
            }
            )
            .catch((err) => {
                console.error(err);
            });
    }, []);


    const handleAddClick = (playerId) => {
        if(bidFlag== true){
            alert('There is a bid going on. Please wait for the bid to complete');
            return;
        }
        

        const addInfo = {
            auctionId: auctionId,
            bidManagerId: bidManagerId,
            playerId: playerId}
        axios
            .post(`http://localhost:9002/addPlayerToBid`, addInfo)
            .then((res) => {
                console.log(res.data);
                alert("Player added to BidZone");
                window.location.reload();
            }
            )
            .catch((err) => {
                console.error(err);
            }
            );
    }

    return (
        <>
            <div>
                <h2 style={{ marginTop: '2rem', fontSize: '24px', }}> Add a player to BidZone</h2>
                <div className='table-container'>
                    <DataTable value={players} tableStyle={{ minWidth: '50rem', minHeight: '12rem' }}>
                        {/* <Column field="PLAYER_ID" header="ID" /> */}
                        <Column field="NAME" header="Name" />
                        <Column field="PHOTO" header="Photo"  body={(rowData) => <img src={rowData.PHOTO} alt="Player" width="100" height="100" />}
             />
                        <Column field="STATUS" header="Status" />
                        <Column field="PLAYING_ROLE" header="Playing Role" />
                        <Column field="BASE_PRICE" header="Base Price" />
                        <Column field="CATEGORY" header="Category" />
                        {/* <Column body={renderColorBox} header="Color" /> */}
                        <Column
                            body={(player) => (
                                // (player.STATUS !== 'unsold' && )?
                                    <Button
                                        label="Add to BidZone"  
                                        onClick={() => handleAddClick(player.PLAYER_ID)}
                                    /> 
                            )}
                            header="Action"
                        />
                    </DataTable>
                </div>

                <div>
                    <h2 style={{ marginTop: '2rem', fontSize: '24px', }}> Currenly in  Bidding </h2>
                    <div className='table-container'>
                        <DataTable value={currentBid} tableStyle={{ minWidth: '50rem', minHeight: '12rem' }}>
                            <Column field="PLAYER_ID" header="ID" />
                            <Column field="PLAYER_PHOTO" header="Photo"
                            body = {(player) => ( <img src={player.PLAYER_PHOTO} alt="player" height="50px" width="50px" />)} 
                            />
                            <Column field="PLAYER_NAME" header="Name" />
                            <Column field="BID_PRICE" header="Bid Price" />
                            {/* <Column field="STATUS" header="Status" /> */}
                            <Column field="PLAYING_ROLE" header="Playing Role" />
                            {/* <Column field="PLAYING_ROLE" header="Playing Role" /> */}
                            <Column field="BASE_PRICE" header="Base Price" />
                            <Column field="CATEGORY" header="Category" />
                            {/* <Column body={renderColorBox} header="Color" /> */}
                        </DataTable>
                    </div>

                </div>

            </div>

        </>
    );
};

export default ManageBid;