import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
// import 
import Collapsible from 'react-collapsible';
// import { Button } from 'primereact/button';


const BidManagerAuctionDetails = () => {
    const { id } = useParams(); // Extract auction ID from URL parameter
    const [auctionDetails, setAuctionDetails] = useState(null);
    const [bidmanagers, setBidmanagers] = useState([]);
    const [currentBidmanager, setCurrentBidmanager] = useState([]);
    const auctionId = window.location.pathname.split('/')[4];
    const bidManagerId = window.location.pathname.split('/')[2];
    // console.log(bidManagerId);
    const navigate = useNavigate();
    console.log(id);
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

    const handleNavigateToiPlayers = () => {
        navigate(`/auction/${auctionId}/iplayers`);
    };
    const handleNavigateToiTeams = () => {
        navigate(`/auction/${auctionId}/iteams`);
    };
    // const handleNavigateToBidManager = () => {
    //     navigate(`/auction/${id}/bidmanager`);
    // };
    const handleNavigateToBiddingArena = () => {
      (auctionDetails.AUCTION_STATUS=== "Current") ? navigate(`/auction/${auctionId}/bidmanager/${bidManagerId}/managebid`) : navigate(`/auction/${id}/ibiddingarena`);
        // navigate(`/auction/${id}/bidmanager/${bidManagerId}/managebid`);
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

            {/* <button onClick={handleNavigateToBidManager}>Bid Manager</button> */}
            <hr />
            {/* {currentBidmanager ? (
              <>
                <table>
                  <tr>
                    <td>
                      <h2> Current Bid Manager: {currentBidmanager.NAME} </h2>
                    </td>
                    <td>
                      <button onClick={() => handlRemoveAuction(currentBidmanager.ID)}>Remove</button>
                    </td>
                  </tr>
    
                </table>
              </>
            ) : (
              <p>No bid manager is yet assigned</p>
            )
            } */}
            
    
            {/* <Collapsible
    
    
              trigger={<Button>Bid Manager</Button>}>
              <div className='table-container'>
                <DataTable value={bidmanagers}>
                  <Column field='ID' header='ID'></Column>
                  <Column field='NAME' header='Name'></Column>
                  <Column field='PHOTO' header='Photo'></Column>
                  <Column field='STATUS' header='Status'></Column>
                  <Column
                    body={(bidmanager) =>
                      bidmanager.STATUS == "pending" ?
                        (<Button label='UNDO' onClick={() => handleUNDO(bidmanager.ID)} />
                        ) : (
                          <Button label='Invite' onClick={() => handleInviteClick(bidmanager.ID)} />
                        )
                    }
                    header='Action'
                  />
                </DataTable>
              </div>
            </Collapsible> */}
    
            <button onClick={handleNavigateToBiddingArena}>Bidding Arena</button>
          </div>
        </div>
      );

};

export default BidManagerAuctionDetails;
