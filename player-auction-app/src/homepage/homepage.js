import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

import { Link, Navigate } from 'react-router-dom';
import Collapsible from 'react-collapsible';
// import { DataTable } from 'primereact/datatable';
// import "../css/homepage.css";
const Homepage = ({ userInfo }) => {
  // const [auctions, setAuctions] = useState([]);
  const [pastAuctions, setPastAuctions] = useState([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [currentAuctions, setCurrentAuctions] = useState([]);
  const [auctionName, setAuctionName] = useState('');
  const [auctionType, setAuctionType] = useState('');
  const userInfosRef = useRef(null);

  useEffect(() => {
    const storedUserInfo = Cookies.get('adminInfo');
    console.log(storedUserInfo);
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      userInfosRef.current = parsedUserInfo;
    }
  }, []);

  useEffect(() => {
    if (userInfosRef.current) {      
      axios.get(`http://localhost:9002/pastAuctions`)
        .then((res) => {
          console.log(res.data);
          setPastAuctions(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
      axios.get(`http://localhost:9002/upcomingAuctions`)
        .then((res) => {
          console.log(res.data);
          setUpcomingAuctions(res.data);
        })
        .catch((err) => {
          console.error(err);
        }
        );
      axios.get(`http://localhost:9002/currentAuctions`)
        .then((res) => {
          console.log(res.data);
          setCurrentAuctions(res.data);
        }
        )
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  const handleCreateAuction = () => {
    const newAuction = {
      name: auctionName,
      type: auctionType,
      adminId: userInfosRef.current.ID, // Get the Admin_Id from userInfosRef
    };

    // Make a POST request to create a new auction
    axios.post('http://localhost:9002/createAuction', newAuction)
      .then((res) => {
        console.log(newAuction);
        // Refresh the list of auctions
        // setAuctions([...auctions, newAuction]);
        setUpcomingAuctions([...upcomingAuctions, newAuction]);
        // Clear the input fields
        setAuctionName('');
        setAuctionType('');


        //reload the page
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleDeleteAuction = (auctionId) => {
    // Make a DELETE request to delete the auction
    axios.delete(`http://localhost:9002/deleteAuction/${auctionId}`)
      .then(() => {
        // Refresh the list of auctions after deletion
        // const updatedAuctions = auctions.filter((auction) => auction.id !== auctionId);
        // setAuctions(updatedAuctions);

        window.location.reload();
        alert("Auction deleted successfully");
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const handleUpdate = (auctionId) => {
    axios.put(`http://localhost:9002/updateAuctionStatus/${auctionId}`)
      .then(() => {
        window.location.reload();
        // Refresh the list of auctions after deletion
      }
      )
      .catch((err) => {
        console.error(err);
      });
  };
  const handleViewAuction = (auctionId) => {
    // Navigate to the auction details page
    
  };


  return (
    <div>
      {userInfosRef.current ? (
        <>
          {/* {console.log("I aaa" )} */}
          <h1>Hello, {userInfosRef.current.NAME}</h1>
          <div>
            <Collapsible 
              triggerWhenOpen={<h2>Past Auctions👀</h2>}
              transitionCloseTime={100}
              transitionTime={300}
              open={false}
              trigger={<h2>Past Auctions</h2>}>
              <ul>
                <DataTable value={pastAuctions}  tableStyle={{  minWidth: '50rem',minHeight: '12rem' }} >
                  <Column field="NAME" header="Auction Name"></Column>
                  <Column field="TYPE" header="Auction Type"></Column>
                  {/* <Column field="ID" header="Auction ID"></Column> */}
                  <Column field="ID" header="View Details" body={(rowData) => <Link to={`/auction/${rowData.ID}`}>View Details</Link>}></Column>
                  {/* <Column
                    body={(auction) => (
                      <Button label="View Details" onClick={() => <Link  />
                    )}
                    header="Action"
                  /> */}

                </DataTable>

              </ul>
            </Collapsible>
          </div>
          <hr></hr>
          <div>
            <Collapsible
              triggerWhenOpen={<h2>Current Auctions👀</h2>}
              transitionCloseTime={100}
              transitionTime={100}
              open={true}
             trigger={<h2>Current Auctions</h2>}>
              
              <ul>
                <DataTable value={currentAuctions} tableStyle={{  minWidth: '50rem',minHeight: '12rem' }}>
                  <Column field="NAME" header="Auction Name"></Column>
                  <Column field="TYPE" header="Auction Type"></Column>
                  {/* <Column field="ID" header="Auction ID"></Column> */}
                  <Column field="ID" header="View Details" body={(rowData) => <Link to={`/auction/${rowData.ID}`}>View Details</Link>}></Column>
                  <Column 
                    body={(auction) => (
                      <Button label = "End Auction" onClick={() => handleUpdate(auction.ID)} />
                    )}
                    header="Action"
                  />
                </DataTable>

              </ul>
            </Collapsible>
          </div>
          <hr></hr>
          <div>
            
            <Collapsible
            triggerWhenOpen={<h2>Upcoming Auctions👀</h2>}
            transitionCloseTime={100}
            transitionTime={100}
            open={true}
             trigger={<h2>Upcoming Auctions</h2>}>
              <ul>
                <DataTable value={upcomingAuctions} tableStyle={{  minWidth: '50rem',minHeight: '12rem' }}>
                  <Column field="NAME" header="Auction Name"></Column>
                  <Column field="TYPE" header="Auction Type"></Column>
                  {/* <Column field="ID" header="Auction ID"></Column> */}
                  <Column field="ID" header="View Details" body={(rowData) => <Link to={`/auction/${rowData.ID}`}>View Details</Link>}></Column>
                  <Column
                    body={(auction) => (
                      <div>

                      <Button label="Start Auction" onClick={() => handleUpdate(auction.ID)} />
                      <Button label="Delete Auction" onClick={() => handleDeleteAuction(auction.ID)} />
                      </div>
                    )}
                    header="Action"
                  />
                </DataTable>

              </ul>
            </Collapsible>

          </div>
          <div>
            <h2>Create New Auction</h2>
            <div className='input-container'>
              <input
                type="text"
                placeholder="Auction Name"
                value={auctionName}
                onChange={(e) => setAuctionName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Auction Type"
                value={auctionType}
                onChange={(e) => setAuctionType(e.target.value)}
              />
            </div>
            <button onClick={handleCreateAuction}>Create Auction</button>
          </div>
        </>
      ) : (
        <p>Loading user information...</p>

      )}
      {/* <button onClick={() => window.location.reload()}>Refresh</button> */}
    </div>

  );
};

export default Homepage;
