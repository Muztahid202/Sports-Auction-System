import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
// import Cookies from 'js-cookie';
// import PlayerModal from './playerModal';
// import css
import '../css/teams.css';

const Teams = () => {
    // const  = useState([]);
    // const userInfosRef = useRef(null);
    const [teams, setTeams] = useState([]);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [currentTeams, setCurrentTeams] = useState([]);
    const [teamId, setTeamId] = useState('');
    const [auctionDetails, setAuctionDetails] = useState('');
    const auctionId = window.location.pathname.split('/')[2];

    useEffect(() => {
        // const auctionId = window.location.pathname.split('/')[2];
        axios.get(`http://localhost:9002/auction/${auctionId}`)
            .then((res) => {
                // console.log(res.data);
                setAuctionDetails(res.data);
                // console.log(auctionDetails);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    useEffect(() => {

        axios
            .get(`http://localhost:9002/teamsInvitationsZone/${auctionId}`)
            .then((res) => {
                setTeams(res.data);
                console.log(teams);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);
    useEffect(() => {
        //from the url: http://localhost:3000/auction/1/players
        //get the auction id
        const auctionId = window.location.pathname.split('/')[2];
        //console.log(`Fetching players for auction ID ${auctionId}`);
        // Fetch players data
        axios
            // .get(`http://localhost:9002/auction/${auctionId}/players`)
            .get(`http://localhost:9002/auction/${auctionId}/teams`)
            .then((res) => {
                // console.log(`Current teams: res.data`);
                setCurrentTeams(res.data);
                console.log(currentTeams);
            }
            )
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const handleInviteClick = (teamId) => {
        if(totalPlayers == 0){
            alert("Please enter total players");
            return;
        }
        else if(totalPlayers < 0){
            alert("Please enter valid total players");
            return;
        }

        setTeamId(teamId);
        console.log(teamId);
        const auctionId = window.location.pathname.split('/')[2];
        const inviteData = {
            auctionId: auctionId,
            teamId: teamId,
            totalPlayers: totalPlayers,
        };
        console.log(inviteData)
        axios.post('http://localhost:9002/assignTeamToAuction', inviteData)
            .then((res) => {
                window.location.reload();
            })
            .catch((err) => {
                console.error(err);
            });
        console.log(`Inviting team with ID ${teamId}`);
    };

    const handleUNDOteam = (teamId) => {
        setTeamId(teamId);
        const auctionId = window.location.pathname.split('/')[2];
        // .delete(`http://localhost:9002/undoPlayerInvitation?playerId=${playerId}&auctionId=${auctionId}`)

        axios.delete(`http://localhost:9002/undoTeamInvitation?teamId=${teamId}&auctionId=${auctionId}`)
            .then((res) => {
                window.location.reload();
            })
            .catch((err) => {
                console.error(err);
            });

    }


    const handleRemoveFromAuction = (teamId) => {
        const auctionId = window.location.pathname.split('/')[2];
        axios.delete(`http://localhost:9002/auction/${auctionId}/teams/${teamId}`)
            .then((res) => {
                const updatedTeams = currentTeams.filter((team) => team.ID !== teamId);
                setCurrentTeams(updatedTeams);
                alert("Team removed from auction");
                window.location.reload();
                console.log(currentTeams);
            })
            .catch((err) => {
                console.error(err);
            });
        console.log(`Removing team with ID ${teamId}`);

    }


    // const handleRemoveFromAuction = (playerId) => {
    //     // Implement your logic for inviting a player to the auction
    //     // You can use axios to send a POST request to the server
    //     const auctionId = window.location.pathname.split('/')[2];
    //     axios
    //         .delete(`http://localhost:9002/auction/${auctionId}/players/${playerId}`)
    //         .then((res) => {
    //             // Refresh the list of auctions after deletion
    //             const updatedPlayers = currentPlayers.filter((player) => player.ID !== playerId);
    //             setCurrentPlayers(updatedPlayers);
    //             console.log(currentPlayers);
    //         })
    //         .catch((err) => {
    //             console.error(err);
    //         });
    //     console.log(`Removing player with ID ${playerId}`);
    // };
    return (
        <>
            <div>
            {auctionDetails && auctionDetails.AUCTION_STATUS == "Future" && (
                <>
                <h2>Teams</h2>
                {console.log(teams)}
                <div className='table-container'>
                    <div className='input-container'>
                        <input type="number" placeholder="Total Players" onChange={(e) => setTotalPlayers(e.target.value)} />

                    </div>
                    <DataTable value={teams}>
                        <Column field="ID" header="ID" />
                        <Column field="NAME" header="Name" />
                        {/* <Column field="BASE_PRICE" header="Base Price" />
          <Column field="CATEGORY" header="Category" /> */}
                        {/* <Column field="TOTAL_FUND" header="Total Fund" /> */}

                        <Column field="LOGO" header="Logo"
                        body = {(team) => ( <img src={team.LOGO} alt="logo" height="50px" width="50px" />)}
                        />
                        {/* <Column field="PLAYING_ROLE" header="Playing Role" /> */}
                        <Column field="STATUS" header="Status"
                         />

                        <Column
                            body={(team) =>
                                team.STATUS== "pending" ? (
                                    <Button label="UNDO" onClick={() => handleUNDOteam(team.ID)}/>
                                ) : (
                                    <Button label="Invite" onClick={() => handleInviteClick(team.ID)} />
                                )

                            }
                            header="Action"
                        />
                    </DataTable>
                </div>
                </>)}
            </div>


            <div className='team-in-auction'>
                <h2>Teams in Auction</h2>

                <div className='table-container'>
                    <DataTable value={currentTeams}>
                        {/* <Column field="ID" header="ID" /> */}
                        <Column field="NAME" header="Name" />
                        <Column field="LOGO" header="Logo" 
                        body = {(team) => ( <img src={team.LOGO} alt="logo" height="50px" width="50px" />)} 
                        />
                        {/* <Column field="STATUS" header="Status" /> */}
                        <Column field="TEAM_TOTAL_FUND" header="Total Fund" />  
                        <Column field="TEAM_AVAILABLE_FUND" header="Available Fund" />
                        <Column field="TEAM_TOTAL_PLAYER" header="Total Players" />
                        <Column field="TEAM_TAKEN_PLAYER" header="Taken Players" />
                        {/* <Column field="STATUS" header="Status" /> */}
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

export default Teams;
