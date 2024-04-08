import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

// import css
import '../css/players.css';


const Players = () => {
    const [players, setPlayers] = useState([]);
    const [basePrice, setBasePrice] = useState('');
    const [category, setCategory] = useState('');
    const [auctionDetails, setAuctionDetails] = useState('');
    // console.log(players);
    const [currentPlayers, setCurrentPlayers] = useState([]);
    const [playerId, setPlayerId] = useState('');
    const auctionId = window.location.pathname.split('/')[2];
    useEffect(() => {
        // const auctionId = window.location.pathname.split('/')[2];
        axios.get(`http://localhost:9002/auction/${auctionId}`)
            .then((res) => {
                console.log(res.data);
                setAuctionDetails(res.data);
                console.log(auctionDetails);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);
    useEffect(() => {
        // Fetch players data

        axios
            .get(`http://localhost:9002/playersInvitationsZone/${auctionId}`,)
            .then((res) => {
                setPlayers(res.data);
                console.log(players);
                // console.log(`Players: ${res.data}`)
                // console.log(1);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);
    useEffect(() => {
        //from the url: http://localhost:3000/auction/1/players
        //get the auction id
        // const auctionId = window.location.pathname.split('/')[2];
        //console.log(`Fetching players for auction ID ${auctionId}`);
        // Fetch players data
        axios
            .get(`http://localhost:9002/auctionplayers/${auctionId}`)
            .then((res) => {
                // console.log(`Current players: res.data`);
                setCurrentPlayers(res.data);
                // console.log(currentPlayers);
                console.log(`Current players: ${res.data}`)
            }
            )
            .catch((err) => {
                console.error(err);
            });
    }, []);


    const handleInviteClick = (playerId) => {
        setPlayerId(playerId);
        if (basePrice == '' || category == '') {
            alert("Please enter base price and category");
            return;
        }

        // const auctionId = window.location.pathname.split('/')[2];
        const inviteData = {
            playerId: playerId,
            auctionId: auctionId,
            basePrice: basePrice,
            category: category,
        };
        console.log(inviteData);
        axios
            .post(`http://localhost:9002/assignPlayerToAuction`, inviteData)
            .then(() => {
                // Handle success or close the modal
                window.location.reload();

                // You can also refresh the player list if needed
                // refreshPlayers();
            })
            .catch((err) => {
                console.error(err);
                // Handle error
            });
        // console.log(`Inviting player with ID ${playerId}`);

    };




    const handleUNDO = (playerId) => {
        setPlayerId(playerId);
        const auctionId = window.location.pathname.split('/')[2];

        axios
            .delete(`http://localhost:9002/undoPlayerInvitation?playerId=${playerId}&auctionId=${auctionId}`)
            .then(() => {
                window.location.reload();
            })
            .catch((err) => {
                console.error(err);
                // Handle error
            });
    };



    const handleRemoveFromAuction = (playerId) => {
        // Implement your logic for inviting a player to the auction
        // You can use axios to send a POST request to the server
        const auctionId = window.location.pathname.split('/')[2];
        axios
            .delete(`http://localhost:9002/auction/${auctionId}/players/${playerId}`)
            .then((res) => {
                // Refresh the list of auctions after deletion
                const updatedPlayers = currentPlayers.filter((player) => player.ID !== playerId);
                setCurrentPlayers(updatedPlayers);
                console.log(currentPlayers);
                window.location.reload();
            })
            .catch((err) => {
                console.error(err);
            });
        console.log(`Removing player with ID ${playerId}`);
    };
    return (
        <>
            <div>
            {auctionDetails && auctionDetails.AUCTION_STATUS == "Future" && (
                <>
                <h2>Players</h2>
                <div className='table-container'tableStyle={{  minWidth: '50rem',minHeight: '12rem' }}>
                    <div className='input-container'>
                        <input
                            type="number"

                            placeholder="Base Price"
                            value={basePrice}
                            onChange={(e) => setBasePrice(e.target.value)}
                        />
                        {/* <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    /> */}
                        <select
                            value={category}
                            // placeholder='Select Category'
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {/* <placeholder>Select Category</placeholder> */}
                            <option value="">Select Category</option>
                            <option value="S">S</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                    </div>

                    <DataTable value={players}>
                        <Column field="ID" header="ID" />
                        <Column field="NAME" header="Name" />
                        <Column field="STATUS" header="Status"
                                body={(player) => (player.STATUS ? player.STATUS : "free")} />
                        <Column field="PLAYING_ROLE" header="Playing Role" />
                        <Column
                            body={(player) =>
                                player.STATUS == "pending" ? (
                                    <Button label="UNDO" onClick={() => handleUNDO(player.ID)} />
                                ) : (
                                    <Button label="Invite" onClick={() => handleInviteClick(player.ID)} />
                                )

                            }
                            header="Action"
                        />
                    </DataTable>
                </div>
                </>)}
            </div>


            <div className='player-in-auction'>
                <h2>Players in Auction</h2>

                <div className='table-container'>
                    <DataTable value={currentPlayers} tableStyle={{  minWidth: '50rem',minHeight: '12rem' }}>
                        <Column field="ID" header="ID" />
                        <Column field="NAME" header="Name" />
                        <Column 
                            field="STATUS" header="Status" 
                            
                        />
                        <Column field="PLAYING_ROLE" header="Playing Role" />
                        <Column field="BASE_PRICE" header="Base Price" />
                        <Column field="CATEGORY" header="Category" />
                        {/* <Column body={renderColorBox} header="Color" /> */}
                        <Column
                            body={(player) => (
                                <Button label="Remove" onClick={() => handleRemoveFromAuction(player.ID)} />
                            )}
                            header="Action"
                        />

                    </DataTable>
                </div>
            </div>
        </>
    );
};

export default Players;
