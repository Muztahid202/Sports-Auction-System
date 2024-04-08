import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import '../css/teamlogin.css'; // Import your CSS file for styling
import Collapsible from 'react-collapsible';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, Navigate } from 'react-router-dom';
// import "../css/homepage.css";

const teamId = window.location.pathname.split('/')[2];
const TeamLogin = ({ userInfo }) => {
    const userInfosRef = useRef(null);
    const [editData, setEditData] = useState({});
    
    // const[teams, setTeams] = useState([]);
    const [team, setTeam] = useState([]);
    const [notifications, setNotifications] = useState(
        []
    );
    const [teamAuctions, setTeamAuctions] = useState([]);

    useEffect(() => {
        const storedUserInfo = Cookies.get('teamInfo');
        if (storedUserInfo) {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            userInfosRef.current = parsedUserInfo;
        }
    }, []);

    useEffect(() => {
        const teamId = window.location.pathname.split('/')[2];
        // console.log(teamId);
        axios.get(`http://localhost:9002/team?teamId=${teamId}`)
            .then((res) => {
                setTeam(res.data);
                console.log(team);
            })
            .catch((err) => {
                console.error(err);
            });
        axios.get(`http://localhost:9002/getTeamNotifications?teamId=${teamId}`)
            .then((res) => {
                const notificationData = res.data;
                console.log(notificationData);
                setNotifications(notificationData);
                console.log(notifications);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [userInfosRef.current]);
    useEffect(() => {
        console.log(notifications);
    }, [notifications]);

    useEffect(() => {
        const teamId = userInfosRef.current.ID;
        axios.get(`http://localhost:9002/teamAuctions?teamId=${teamId}`)
            .then((res) => {
                setTeamAuctions(res.data);
                console.log(teamAuctions);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [userInfosRef.current]);

    const actionButtons = (rowData) => {
        return (
            <div>
                <Button label="Accept" onClick={() => handleAccept(rowData)} />
                <Button label="Decline" onClick={() => handleDecline(rowData)} />
            </div>
        );
    };
    const handleAccept = (notification) => {

        // Implement logic to accept the notification
        // For example, send a request to your backend to accept the notification
        const teamId = userInfosRef.current.ID;
        const auctionId = notification.auctionId;
        console.log(teamId, auctionId);
        axios
            .post(`http://localhost:9002/teamAssignmentResponse`,
                {
                    teamId: teamId,
                    auctionId: auctionId,
                    response: "accept",
                })
            .then((res) => {
                console.log(res.data);
                alert('Team assignment accepted successfully');
                window.location.reload();
            })
            .catch((err) => {
                console.error(err);
            });
        // After successful acceptance, you can update the UI or refresh the notifications list
    };

    const handleDecline = (notification) => {
        // Implement logic to decline the notification
        // For example, send a request to your backend to decline the notification

        // After successful decline, you can update the UI or refresh the notifications list
    };


    useEffect(() => {
        const teamId = userInfosRef.current.ID;
        // console.log(teamId);
        axios.get(`http://localhost:9002/team?teamId=${teamId}`)
            .then((res) => {
                setTeam(res.data);
                console.log(team);
                setEditData(res.data);
                userInfosRef.current = res.data;
            })
            .catch((err) => {
                console.error(err);
            });
        axios.get(`http://localhost:9002/getTeamNotifications?teamId=${teamId}`)
            .then((res) => {
                const notificationData = res.data;
                console.log(notificationData);
                setNotifications(notificationData);
                console.log(notifications);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);
    const handleEditSubmit = () => {
        // Send a POST request to update player info
        // const bidmanagerId = userInfosRef.current.ID;
        console.log(`Updating team info for team ID: ${teamId}`);
        // console.log(`data: ${editData}`);
        // console.log(editData);
        //const { player_name, age, mail, photo, playing_role } = req.body;
        const sendData = { 
            teamId: editData.ID,
            mail: editData.MAIL,
            logo: editData.LOGO,
        };
        axios
            .post(`http://localhost:9002/updateTeamInfo`, sendData)
            .then((res) => {
                console.log(res.data);
                alert('Team info updated successfully');
                window.location.reload();
                // You can optionally update the userInfosRef or cookies here if needed
            })
            .catch((err) => {
                console.error(err);
            });
    };
    const handleEditInputChange = (event) => {
        const { name, value } = event.target;
        setEditData({ ...editData, [name]: value });
        console.log(editData);
    };
    // const actionButtons = (rowData) => {
    //     return (
    //         <div>
    //             <Button label="Accept" onClick={() => handleAccept(rowData)} />
    //             <Button label="Decline" onClick={() => handleDecline(rowData)} />
    //         </div>
    //     );
    // };
    // const handleAccept = (notification) => {

    //     // Implement logic to accept the notification
    //     // For example, send a request to your backend to accept the notification
    //    const teamId = userInfoRef.current.ID;
    //    const auctionId = notification.auctionId;
    //    console.log(TeamId, auctionId);
    //    axios
    //     .post(`http://localhost:9002/teamAssignmentResponse`,
    //     {
    //         teamId: teamId,
    //         auctionId: auctionId,
    //         response: "accept"
    //     })
    //     .then((res) => {
    //         console.log(res.data);
    //     })
    //     .catch((err) => {
    //         console.error(err);
    //     });
    //     // After successful acceptance, you can update the UI or refresh the notifications list
    // };       


    return (
        <div >
            {userInfosRef.current ? (
                <>
                    {(team.LOGO? 
                    <img src = {team.LOGO} alt="Team Logo" width="200" height="200" />:
                    <img src = "https://cdn.dribbble.com/users/2478001/screenshots/14230640/media/d11f9bc5e8cf84167772597a39964b9b.png?resize=1000x750&vertical=center" alt="Team Logo" width="200" height="200" />)}
                    {/* <img src = {team.LOGO} alt="Team Logo" width="200" height="200" /> */}
                    <h1> Hello, {team.NAME}</h1>
                    <h2> Team ID: {team.ID}</h2>
                    <br />
                    
                    <div>
                        <Collapsible
                             triggerWhenOpen={`Edit Info ℹ`}
                    
                             trigger={
                                `Team Info ℹ`
                                
                            }
                             transitionCloseTime={100}
                             transitionTime={300}
                             open={false}
     
                         >
                             <div className='input-container'>
                            {/* Edit form */}
                            
                                <label>Email:</label>
                                <input
                                    type="text"
                                    name="MAIL"
                                    value={editData.MAIL || ''}
                                    onChange={handleEditInputChange}
                                />
                                <br></br>
                                <label>Logo :</label>
                                <input
                                    type="text"
                                    name="LOGO"
                                    value={editData.LOGO || ''}
                                    onChange={handleEditInputChange}
                                />
                                <button type="submit"
                                    onClick={handleEditSubmit}>Save Changes</button>
                        

                        </div>

                        </Collapsible>
                    </div>
                    <br />
                    {/* <h2>Notifications</h2> */}
                    <Collapsible trigger={<div className='noti'>Notifications</div>}>
                        {
                            notifications && notifications.length > 0 ? (
                                <DataTable value={notifications} className='table'>
                                    <Column field="auctionName" header="Auction Name" />
                                    <Column field="auctionType" header="Auction Type" />
                                    <Column field="totalPlayers" header="Total Players" />
                                    {/* <Column field="auctionId" header="Auction ID" /> */}
                                    <Column header="Action" body={actionButtons} />

                                </DataTable>
                            ) : (
                                <p>No notifications</p>
                            )
                        }

                    </Collapsible>
                    <Collapsible
                        trigger=
                        
                            {teamAuctions && teamAuctions.length > 0 ? (
                                <p>
                                    <div className='noti'>Assigned Auctions ( {teamAuctions.length} )</div>
                                </p>
                            ) : (
                                <p>
                                    <div className='noti'>No Assigned Auctions</div>
                                </p>
                            )

                            }
                            // <p>
                            //     <div className='noti'>Assigned Auctions</div>
                            // </p>
                        
                        
                    >
                        {
                            teamAuctions && teamAuctions.length > 0 ? (

                                <DataTable value={teamAuctions} className='table' >
                                    <Column field="NAME" header="Auction Name" />
                                    <Column field="TYPE" header="Auction Type" />
                                    <Column
                                        field="AUCTION_STATUS"
                                        header="Auction Status"
                                        align='center'
                                        body={(rowData) =>
                                            rowData.AUCTION_STATUS === "Current" ? "Ongoing" : rowData.AUCTION_STATUS
                                        }
                                    />
                                    <Column
                                        header="Action"

                                        body={(rowData) =>
                                            rowData.AUCTION_STATUS === "Current" ? (
                                                <Link to={`/team/${team.ID}/auction/${rowData.ID}`} >
                                                    <Button label="View Auction" />
                                                </Link>
                                            ) : (
                                                <Link to={`/team/${team.ID}/auction/${rowData.ID}`} >
                                                    <Button label="View Auction" />
                                                </Link>
                                            )
                                        }
                                    />

                                </DataTable>
                            ) : (
                                <p>No assigned auctions</p>
                            )
                        }

                    </Collapsible>

                </>
            )
                : (
                    <p> Loading info....</p>
                )

            }
        </div>
    );

};


export default TeamLogin;