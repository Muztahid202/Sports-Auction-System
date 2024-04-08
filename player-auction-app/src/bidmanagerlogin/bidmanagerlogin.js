import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import '../css/teamlogin.css'; // Import your CSS file for styling
import Collapsible from 'react-collapsible';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, Navigate } from 'react-router-dom';
import {useNavigate} from 'react-router-dom';

const BidManagerLogin = ({ userInfo }) => {
    const userInfosRef = useRef(null);
    const [bidManager, setBidManager] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [bidManagerAuctions, setBidManagerAuctions] = useState([]);
    const navigate = useNavigate();
    const bidManagerId = window.location.pathname.split('/')[2];
    const [editData, setEditData] = useState({});

    useEffect(() => {
        const storedUserInfo = Cookies.get('bidmanagerInfo');
        if (storedUserInfo) {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            userInfosRef.current = parsedUserInfo;
        }
    }
        , []);

    useEffect(() => {
        // const teamId = userInfosRef.current.ID;
        axios.get(`http://localhost:9002/BidManagerAuctions?bidManagerId=${bidManagerId}`)
            .then((res) => {
                setBidManagerAuctions(res.data);
                console.log(bidManagerAuctions);
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
        const bidManagerId = userInfosRef.current.ID;
        const auctionId = notification.auctionId;
        console.log(bidManagerId, auctionId);
        axios
            .post(`http://localhost:9002/bidManagerAssignmentResponse`,
                {
                    bidManagerId: bidManagerId,
                    auctionId: auctionId,
                    response: "accept",
                })
            .then((res) => {
                console.log(res.data);
                window.current.location.reload();
                // alert('Bid Manager assignment accepted successfully')
                alert('Congratulations! You have been assigned as a bid manager to the auction successfully');
            })
            .catch((err) => {
                console.error(err);
            });
        // After successful acceptance, you can update the UI or refresh the notifications list
    };
    const handleDecline = (notification) => { };
    useEffect(() => {
        const bidManagerId = userInfosRef.current.ID;
        // console.log(bidManagerId);
        axios.get(`http://localhost:9002/bidManager?bidManagerId=${bidManagerId}`)
            .then((res) => {
                setBidManager(res.data);
                console.log(bidManager);
                setEditData(res.data);
                userInfosRef.current = res.data;
            })
            .catch((err) => {
                console.error(err);
            });
        axios.get(`http://localhost:9002/getBidManagerNotifications?bidManagerId=${bidManagerId}`)
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
    useEffect(() => {
        console.log(notifications);
    }, [notifications]);

    const handleLogout = () => {
        Cookies.remove('bidmanagerInfo');
        // Navigate('/')
        // window.location.reload();
        // return <Navigate to="/" />;
        navigate('/');
        alert("Logged out successfully");
    };
    const handleEditInputChange = (event) => {
        const { name, value } = event.target;
        setEditData({ ...editData, [name]: value });
        console.log(editData);
    };
    const handleEditSubmit = () => {
        // Send a POST request to update player info
        // const bidmanagerId = userInfosRef.current.ID;
        console.log(`Updating info for bidmanager ID: ${bidManagerId}`);
        // console.log(`data: ${editData}`);
        // console.log(editData);
        //const { player_name, age, mail, photo, playing_role } = req.body;
        const sendData = { 
            bidManagerId: bidManagerId,
            mail: editData.MAIL,
            photo: editData.PHOTO,
        };
        axios
            .post(`http://localhost:9002/updateBidManagerInfo/${bidManagerId}`, sendData)
            .then((res) => {
                console.log(res.data);
                alert('Bid Manager info updated successfully');
                window.location.reload();
                // You can optionally update the userInfosRef or cookies here if needed
            })
            .catch((err) => {
                console.error(err);
            });
    };
    return (
        <div>
            {userInfosRef.current ? (
                <>
                    <img src={userInfosRef.current.PHOTO} alt="Profile" />
                    <h1>Welcome {userInfosRef.current.NAME}</h1>
                
                    <div>
                        <Collapsible
                             triggerWhenOpen={`Edit Info ℹ`}
                    
                             trigger={
                                `Your Info ℹ`
                                
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
                    </div>
                    <br />
                    <Collapsible trigger={`Notifications (${notifications.length})`}>
                        {notifications && notifications.length > 0 ? (
                            <DataTable value={notifications}>
                                {/* <Column field="NOTIFICATION" header="Notification" /> */}
                                <Column field="auctionName" header="Auction Name" />
                                <Column field="auctionType" header="Auction Type" />
                                <Column field="ACTION" header="Action" body={actionButtons} />
                            </DataTable>
                        ) : (
                            <h3>No notifications</h3>
                        )}
                    </Collapsible>

                    <Collapsible
                        trigger=

                        {bidManagerAuctions && bidManagerAuctions.length > 0 ? (
                            <p>
                                <div className='noti'>Assigned Auctions ( {bidManagerAuctions.length} )</div>
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
                            bidManagerAuctions && bidManagerAuctions.length > 0 ? (

                                <DataTable value={bidManagerAuctions} className='table' >
                                    <Column field="NAME" header="Auction Name" />
                                    <Column field="TYPE" header="Auction Type" />
                                    <Column
                                        field="AUCTION_STATUS"
                                        header="Auction Status"
                                        align='center'
                                        body={(rowData) =>
                                            rowData.AUCTION_STATUS === "Current" ? "Ongoing" : rowData.AUCTION_STATUS==="Future" ? "Upcoming" : "Finished"
                                        }
                                    />
                                    <Column
                                        header="Action"
                                        body={(rowData) =>
                                            rowData.AUCTION_STATUS ? (
                                                <Link to={`/bidmanager/${bidManagerId}/auction/${rowData.ID}`} >
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
                                <p>No assigned auctions</p>
                            )
                        }

                    </Collapsible>
                    <div>
                        {/* <button onClick={handleLogout}>Logout</button> */}
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </>
            ) : (
                // <Navigate to="/login" />

                <h1>Please login</h1>
            )}
        </div>
    );
};

export default BidManagerLogin;