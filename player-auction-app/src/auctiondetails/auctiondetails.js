import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
// import 
import Collapsible from 'react-collapsible';
// import { Button } from 'primereact/button';

const AuctionDetails = () => {
  const { id } = useParams(); // Extract auction ID from URL parameter
  const [auctionDetails, setAuctionDetails] = useState(null);
  const [bidmanagers, setBidmanagers] = useState([]);
  const [currentBidmanager, setCurrentBidmanager] = useState([]);
  const auctionId = window.location.pathname.split('/')[2];
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch auction details using the auction ID
    axios.get(`http://localhost:9002/auction/${id}`)
      .then((res) => {
        setAuctionDetails(res.data);
        console.log(auctionDetails);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);
  useEffect(() => {
    // Fetch bidmanagers data
    axios
      .get(`http://localhost:9002/bidmanagersInvitationsZone/${auctionId}`)
      .then((res) => {
        setBidmanagers(res.data);
        console.log(bidmanagers);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  useEffect(() => {
    axios
      .get(`http://localhost:9002/auctionBidManagers/${auctionId}`)
      .then((res) => {
        console.log(res.data);
        const current = res.data;

        setCurrentBidmanager(current[0]);
        console.log(currentBidmanager);
      }
      )
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleNavigateToPlayers = () => {
    (auctionDetails.AUCTION_STATUS == 'Future') ? navigate(`/auction/${id}/players`) : navigate(`/auction/${id}/iplayers`);
    // navigate(`/auction/${id}/players`);
  };

  const handleNavigateToTeams = () => {
    (auctionDetails.AUCTION_STATUS == 'Future') ? navigate(`/auction/${id}/teams`) : navigate(`/auction/${id}/iteams`);
    // navigate(`/auction/${id}/teams`);
  };

  const handleNavigateToBiddingArena = () => {
    navigate(`/auction/${id}/bidding-arena`);
  };

  const handleInviteClick = (bidmanagerId) => {
    const inviteData = {
      auctionId: auctionId,
      bidManagerId: bidmanagerId,
    };
    console.log(inviteData);

    axios
      .post(`http://localhost:9002/assignBidManagerToAuction`, inviteData)
      .then((res) => {
        alert('Bid Manager invited successfully');
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
      }
      );

  };

  const handleUNDO = (bidmanagerId) => {
    const inviteData = {
      auctionId: auctionId,
      bidManagerId: bidmanagerId,
    };
    console.log(inviteData);

    axios
      .delete(`http://localhost:9002/undoBidManagerInvitation?auctionId=${auctionId}&bidManagerId=${bidmanagerId}`)
      .then((res) => {
        alert('Bid Manager removed successfully');
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
      }
      );

  };
  const handlRemoveAuction = (bidmanagerId) => {
    const inviteData = {
      auctionId: auctionId,
      bidManagerId: bidmanagerId,
    };

    axios
      .delete(`http://localhost:9002/auction/${auctionId}/bidManagers/${bidmanagerId}`)
      .then((res) => {
        alert('Bid Manager removed successfully');
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
      }
      );

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
        <button onClick={handleNavigateToPlayers}>Players</button>
        <button onClick={handleNavigateToTeams}>Teams</button>
        {/* <button onClick={handleNavigateToBidManager}>Bid Manager</button> */}
        <hr />
        {currentBidmanager ? (
          <>
            <table>
              <tr>
                <td>
                  <h2> Current Bid Manager: {currentBidmanager.NAME} </h2>
                </td>
                <td>
                  {

                  auctionDetails && auctionDetails.AUCTION_STATUS == 'Future' ? (
                  <button onClick={() => handlRemoveAuction(currentBidmanager.ID)}>Remove</button>
                  ) : (
                    <></>
                  )}
                </td>
              </tr>

            </table>
          </>
        ) : (
          <p>No bid manager is yet assigned</p>
        )
        }
        

        <Collapsible


          trigger={<Button>Bid Manager</Button>}>
          <div className='table-container'>
            <DataTable value={bidmanagers}>
              <Column field='ID' header='ID'></Column>
              <Column field='NAME' header='Name'></Column>
              <Column field='PHOTO' header='Photo'
                body={(rowData) => <img src={rowData.PHOTO} alt="Player" width="100" height="100" />}
              ></Column>
              <Column field='STATUS' header='Status' data = {bidmanagers.STATUS? bidmanagers.STATUS : "free"}></Column>
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
        </Collapsible>

        <button onClick={handleNavigateToBiddingArena}>Bidding Arena</button>
      </div>
    </div>
  );
};

export default AuctionDetails;
