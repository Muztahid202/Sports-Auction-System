import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

import '../css/biddingarena.css';

const BiddingArena = () => {
    const [currentBid, setCurrentBid] = useState([]);
    const [biddingPrice, setBiddingPrice] = useState('');
    const auctionId = window.location.pathname.split('/')[2];
    const teamId = window.location.pathname.split('/')[4];
    // to fetch the current bidding player

    useEffect(() => {

        axios.get(`http://localhost:9002/currentBiddingPlayers/${auctionId}`)
            .then((res) => {
                console.log(res.data);
                setCurrentBid(res.data);
            }
            )
            .catch((err) => {
                console.error(err);
            });
    }, []);
    const handleBidClick = (playerId) => {
        const addInfo = {
            teamId: teamId,
            auctionId: auctionId,
            playerId: playerId,
            biddingPrice: biddingPrice
        }
        if (biddingPrice === '') {
            alert('Please enter bidding price');
            return;
        }
        if (biddingPrice < 0) {
            alert('Please enter a valid bidding price');
            return;
        }
        if(biddingPrice<currentBid[0].BID_PRICE){
            alert('Please enter a bidding price greater than current bid');
            return;
        }

        axios
            .post(`http://localhost:9002/placeTeamBid`, addInfo)
            .then((res) => {
                window.location.reload();

            }
            )
            .catch((err) => {
                console.error(err);
                alert(err.response.data.error);
            }
            );
    }

    const handleChange = (e) => {
        console.log(biddingPrice);
        setBiddingPrice(e.target.value);
    }




    return (

        <div className="bidding-arena">
            <div className="bidding-arena-header">

                <h1>Bidding Arena</h1>

                <hr></hr>
            </div>
            <div className="bidding-arena-body">

                <div>
                    <h2 style={{ marginTop: '2rem', fontSize: '24px', }}> Currenly in  Bidding </h2>
                    <div className='table-container'>
                    

                        <DataTable value={currentBid} tableStyle={{ minWidth: '50rem', minHeight: '12rem' }}>
                            <Column field="PLAYER_ID" header="ID" />
                            <Column field="PLAYER_PHOTO" header="Photo" 
                            body = {(team) => ( <img src={team.PLAYER_PHOTO} alt="logo" height="50px" width="50px" />)} 
                            />
                            <Column field="PLAYER_NAME" header="Name" />
                            <Column field="BID_PRICE" header="Bid Price" />
                            {/* <Column field="STATUS" header="Status" />
                            <Column field="PLAYING_ROLE" header="Playing Role" />
                            <Column field="PLAYING_ROLE" header="Playing Role" />
                            <Column field="BASE_PRICE" header="Base Price" />
                            <Column field="CATEGORY" header="Category" /> */}
                            {/* <Column
                                header="Action"
                                body={(player) =>
                                (
                                    <Button label="BID" onClick={() => handleBidClick(player.PLAYER_ID)} />
                                )
                                }
                            /> */}

                            {/* <Column body={renderColorBox} header="Color" /> */}
                        </DataTable>
                    </div>

                </div>
            </div>
        </div>



    );
};


export default BiddingArena;