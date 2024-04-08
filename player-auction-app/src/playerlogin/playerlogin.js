import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import Collapsible from 'react-collapsible';
import '../css/PlayerLogin.css'; // Import your CSS file for styling

import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, Navigate } from 'react-router-dom';
// import "../css/homepage.css";

const PlayerLogin = ({ userInfo }) => {
    const navigate = useNavigate();
    const userInfosRef = useRef(null);
    // const [players, setPlayers] = useState([]);
    const [player, setPlayer] = useState([]); // Changed from useState([]) to useState({}) to fix the error
    const [notifications, setNotifications] = useState([]);
    const [playerAuctions, setPlayerAuctions] = useState([]);
    const [editData, setEditData] = useState({});
    const [playerSales, setPlayerSales] = useState([]);
    useEffect(() => {
        // const storedUserInfo = Cookies.get('userInfo');
        const storedUserInfo = Cookies.get('playerInfo');
        if (storedUserInfo) {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            userInfosRef.current = parsedUserInfo;
            // setPlayer(parsedUserInfo); // Added this line to fix the error
            // setEditData(parsedUserInfo);
        }
        console.log(userInfosRef.current)
    }, []);

    useEffect(() => {
        if (userInfosRef.current) {

            const playerId = userInfosRef.current.ID; // Get the player_id from userInfosRef
            // console.log(`Fetching player details for player ID: ${playerId}`);
            axios.get(`http://localhost:9002/player?playerId=${playerId}`)
                .then((res) => {
                    console.log(res.data);
                    // const updatedUserInfo = { ...userInfosRef.current, INVITATIONSTATUS: res.data.INVITATIONSTATUS };
                    // userInfosRef.current = updatedUserInfo;
                    // setPlayer(res.data);
                    userInfosRef.current = res.data; // Update the userInfosRef with the latest value
                    setEditData(res.data);
                })
                .catch((err) => {
                    console.error(err);
                });
            
        }

    }, []);

    useEffect(() => {

        axios.get(`http://localhost:9002/playerAuctions?playerId=${userInfosRef.current.ID}`)
            .then((res) => {
                console.log(res.data);
                setPlayerAuctions(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
            

        if (userInfosRef.current) {
            const playerId = userInfosRef.current.ID;
            axios
                .get(`http://localhost:9002/getNotifications?playerId=${playerId}`)
                .then((res) => {
                    // console.log(res.data);
                    const notificationData = res.data;


                    console.log(notificationData);
                    setNotifications(notificationData);
                    console.log(notifications);
                    // setNotifications(res.data); // Assuming you have a state for notifications
                    // console.log(`Notifications: ${res.data}`);
                })
                .catch((err) => {
                    console.error(err);
                });
            
            axios .get(`http://localhost:9002/playerSales?playerId=${playerId}`)
                .then((res) => {
                    console.log(res.data);
                    setPlayerSales(res.data);
                }
                )
                .catch((err) => {
                    console.error(err);
                }
                );

        }

    }, [userInfosRef.current]);



    useEffect(() => {
        console.log(notifications); // This will log the updated state when it changes
    }, [notifications]);


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
        const playerId = userInfosRef.current.ID;
        const auctionId = notification.auctionId;
        console.log(playerId, auctionId);
        axios
            .post(`http://localhost:9002/playerAssignmentResponse`,
                {
                    playerId: playerId,
                    auctionId: auctionId,

                    response: "accept",
                })
            .then((res) => {
                console.log(res.data);
                alert('Player assignment accepted successfully');
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


    const handleLogout = () => {
        Cookies.remove('playerInfo');
        // Navigate('/')
        // window.location.reload();
        // return <Navigate to="/" />;
        navigate('/login');
        alert("Logged out successfully");
    };

    //handle edit
    const handleEditInputChange = (event) => {
        const { name, value } = event.target;
        setEditData({ ...editData, [name]: value });
        console.log(editData);
    };

    const handleEditSubmit = () => {
        // Send a POST request to update player info
        const playerId = userInfosRef.current.ID;
        console.log(`Updating player info for player ID: ${playerId}`);
        // console.log(`data: ${editData}`);
        // console.log(editData);
        //const { player_name, age, mail, photo, playing_role } = req.body;
        const sendData = { 
            player_name: editData.NAME, 
            age: editData.AGE,
            mail: editData.MAIL,
            photo: editData.PHOTO,
            playing_role: editData.PLAYING_ROLE,
            country: editData.COUNTRY
        };
        axios
            .post(`http://localhost:9002/updatePlayerInfo/${playerId}`, sendData)
            .then((res) => {
                console.log(res.data);
                alert('Player info updated successfully');
                window.location.reload();
                // You can optionally update the userInfosRef or cookies here if needed
            })
            .catch((err) => {
                console.error(err);
            });
    };



    return (
        <div className="playerlogin">
            <div>
                {userInfosRef.current ? (

                    <>
                        <div style={{ display: 'flex', alignItems: 'center' }}>

                            {userInfosRef.current.PHOTO ? (
                                <img src={`${userInfosRef.current.PHOTO}`} height={200} />
                            ) : (
                                <img
                                    
                                    style={
                                        {
                                            padding: '1px',             // Some padding
                                            border: '2px solid #000', // Border width and color
                                            borderRadius: '100px',      // Rounded corner radius
                                            height: '100px',            // Desired height of the image
                                        }}
                                    alt="Player Photo"
                                    src={`https://beforeigosolutions.com/wp-content/uploads/2021/12/dummy-profile-pic-200x200-1.png`} height={200} />
                            )}
                        </div>
                        <div>
                            {/* {console.log("I aaa" )} */}
                            <h1>Hello, {userInfosRef.current.NAME}</h1>
                            <h2>Email: {userInfosRef.current.MAIL}</h2>
                            <h2>Playing Role: {userInfosRef.current.PLAYING_ROLE}</h2>
                        </div>
                        {/* PHOTO */}
                        {/* <h2>Status: {userInfosRef.current.INVITATIONSTATUS}</h2> */}
                        {/* images are in assets/photos/ directory */}
                        {/* <img src={`${userInfosRef.current.PHOTO}`} height={200} /><br />
                     */}
                        {/* <ul>
                        {notifications.map((notification) => (
                            <li key={notification.NOTIFICATIONID}>
                            <strong>{notification.AUCTIONID}</strong> - {notification.BASEPRICE} 
                            <Button label="Accept" onClick={() => handleAccept(notification)} />
                            <Button label="Decline" onClick={() => handleDecline(notification)} />
                            </li>
                            ))}
                            
                        </ul> */}
                        
                        
                        <Collapsible
                        triggerWhenOpen={<Button>Edit Info ℹ</Button>}
                        trigger={<Button>Edit Info ℹ</Button>}
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
                                {/* Add other input fields for age, playing role, country, and photo link */}
                                <label>Age:</label>
                                <input
                                    type="text"
                                    name="AGE"
                                    value={editData.AGE || ''}
                                    onChange={handleEditInputChange}
                                />
                                <br></br>
                                {/* Add other input fields for playing role, country, and photo link */}
                                <label>Playing Role:</label>
                                <input
                                    type="text"
                                    name="PLAYING_ROLE"
                                    value={editData.PLAYING_ROLE || ''}
                                    onChange={handleEditInputChange}
                                />
                                <br></br>
                                {/* Add other input fields for country and photo link */}
                                <label>Country:</label>
                                <input
                                    type="text"
                                    name="COUNTRY"
                                    value={editData.COUNTRY || ''}
                                    onChange={handleEditInputChange}
                                />
                                <br></br>
                                <label>Photo Link:</label>
                                <input
                                    type="text"
                                    name="PHOTO"
                                    value={editData.PHOTO || ''}
                                    onChange={handleEditInputChange}
                                />
                                <button type="submit"
                                    onClick={handleEditSubmit}>Save Changes</button>
                        

                        </div>


                    </Collapsible>
                    
                        {/* < updateinfo/> */}
                    </>
                ) : (
                    <p>Loading user information...</p>

                )}
                <div>

                <Collapsible 
                    trigger={`Notifications (${notifications.length})`}
                    // triggerDisabled={notifications.length === 0}
                    >
                        {notifications && notifications.length > 0 ? (
                            <DataTable value={notifications}>
                                {/* <Column field="NOTIFICATION" header="Notification" /> */}
                                <Column field="auctionName" header="Auction Name" />
                                <Column field="auctionType" header="Auction Type" />
                                <Column field="ACTION" header="Action" body={actionButtons} />
                            </DataTable>
                        ) : (
                            <h3>Kono notification ashenaai😭 <br></br>Refresh diye dekhen</h3>
                        )}
                    </Collapsible>
                  

                    <Collapsible
                        trigger=

                        {playerAuctions && playerAuctions.length > 0 ? (
                            <p>
                                
                                <div className='noti'>Assigned Auctions ( {playerAuctions.length} )</div>
                            </p>
                        ) : (
                            <p>
                                  <div className='noti'>Assigned Auctions ( {playerAuctions.length} )</div>
                            </p>
                        )
                        

                        }
                        // triggerDisabled={playerAuctions.length === 0}
                    // <p>
                    //     <div className='noti'>Assigned Auctions</div>
                    // </p>


                    >
                        {
                            playerAuctions && playerAuctions.length > 0 ? (

                                <DataTable value={playerAuctions} className='table' >
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
                                            rowData.AUCTION_STATUS ? (

                                                <Link to={`/auction/${rowData.ID}/player/${userInfosRef.current.ID}`} >
                                                    <Button label="View Auction" /> 
                                                </Link>

                                            ) : (
                                                <Link to={`/auction/${rowData.ID}`}>
                                                    <Button label="View Auction" />
                                                </Link>
                                            )
                                        }
                                    />

                                </DataTable>
                            ) : (
                                <p>😭😭😭😭😭😭😭😭😭😭😭</p>
                            )
                        }

                    </Collapsible>

                    <Collapsible
                        trigger= {
                            playerSales && playerSales.length > 0 ? (
                                <p>
                                    <div className='noti'>Sales Details ( {playerSales.length} )</div>
                                </p>
                            ) : (
                                <p>
                                    <div className='noti'>Sales Details ( {playerSales.length} )</div>
                                </p>
                            )
                        }
                        // triggerDisabled={playerSales.length === 0}
                    
                    >

                        {
                            playerSales && playerSales.length > 0 ? (
                                <DataTable value={playerSales} className='table' >
                                    <Column field="AUCTION_NAME" header="Auction Name" />
                                    <Column field="TEAM_NAME" header="Team Name" />
                                    <Column field="PRICE" header="Sold Price" />
                                </DataTable>
                            ) : (
                                <p><br></br> Still no one is interested in you😿</p>
                            )
                        }
                    </Collapsible>

                </div>
                <button onClick={() => window.location.reload()}>Refresh</button>

            </div>
            <div>
                {/* <button onClick={handleLogout}>Logout</button> */}
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>

    );
};

export default PlayerLogin;
