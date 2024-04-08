import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
// import 
import Collapsible from 'react-collapsible';
// import { Button } from 'primereact/button';


const TeamAuctionDetails = () => {
  const { id } = useParams(); // Extract auction ID from URL parameter
  const [auctionDetails, setAuctionDetails] = useState(null);
  const [bidmanagers, setBidmanagers] = useState([]);
  const [totalFund, setTotalFund] = useState(0);
  const [currentBidmanager, setCurrentBidmanager] = useState([]);
  const [currentPlayers, setCurrentPlayers] = useState([]);
  const auctionId = window.location.pathname.split('/')[4];
  const teamId = window.location.pathname.split('/')[2];
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch auction details
    axios
      .get(`http://localhost:9002/auction/${id}`)
      .then((res) => {
        setAuctionDetails(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
    axios
      .get(`http://localhost:9002/teamPlayers?teamId=${teamId}&auctionId=${id}`)
      .then((res) => {
        setCurrentPlayers(res.data);
        console.log(currentPlayers);
      }
      )
      .catch((err) => {
        console.error(err);
      });
    axios.get(`http://localhost:9002/getTotalFundForAuction?teamId=${teamId}&auctionId=${id}`)
      .then((res) => {
        setTotalFund(res.data);
        console.log(`Total fund is ${totalFund}`);

      })
      .catch((err) => {
        console.error(err);
      }
      );
  }, []);
  const handleNavigateToiPlayers = () => {
    navigate(`/auction/${id}/iplayers`);
  };
  const handleNavigateToiTeams = () => {
    navigate(`/auction/${id}/iteams`);
  };
  // const handleNavigateToBidManager = () => {
  //     navigate(`/auction/${id}/bidmanager`);
  // };
  const handleNavigateToBiddingArena = () => {
    if (auctionDetails.AUCTION_STATUS === 'Current') {
      navigate(`/auction/${id}/team/${teamId}/bidding-arena`);
    }
    else if (auctionDetails.AUCTION_STATUS === 'Future') {
      alert('Auction has not started yet');
      return;
    }
    else {
      alert('Auction has ended');
      return;
    }

  };

  const handleSetTotalFund = (totalFund) => {
    if (totalFund < 0) {
      alert('Total fund cannot be negative');
      return;
    }
    else if (totalFund == 0) {
      alert('Total fund cannot be zero');
      return;
    }
    else {
      /*
          app.post("/setTotalFundForAuction", async (req, res) => {
          const { teamId, auctionId, totalFund } = req.body; */
      const totalFundData = {
        teamId: teamId,
        auctionId: auctionId,
        totalFund: totalFund,
      };
      console.log(totalFundData);
      axios
        .post(`http://localhost:9002/setTotalFundForAuction`, totalFundData)
        .then((res) => {
          console.log(res.data);
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
        });
    }
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
        <Collapsible
          trigger={
            (totalFund > 0) ? (
              <p>Total Fund: {totalFund}</p>
            ) : (
              <p>ADD Total Fund </p>
            )
          }
          triggerDisabled={totalFund > 0}
        // triggerDisabled={
        >
          <div className='input-container'>
            <input
              type="number"
              placeholder="Total Fund"
              value={totalFund || 0}

              onChange={(e) => setTotalFund(e.target.value)}
            />
            <button onClick={() => handleSetTotalFund(totalFund)}>Set Total Fund</button>
          </div>
        </Collapsible>

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

        <Collapsible
          trigger={
            (currentPlayers && currentPlayers.length > 0) ? (
              <p>Players in your team</p>
            ) : (
              <p>Players in your team</p>
            )




          }

        >
          {
            currentPlayers && currentPlayers.length > 0 ? (
              <DataTable value={currentPlayers} className='table'>
                {/* <Column field="auctionName" header="Auction Name" /> */}
                {/* <Column field="auctionType" header="Auction Type" /> */}
                <Column field="PLAYER_NAME" header="Name" />
                <Column field="PLAYER_AGE" header="Age" />
                
                <Column field="PLAYER_BIDDING_PRICE" header = "Sold at Price"></Column>
                <Column field="PLAYER_PHOTO" header = "Photo"></Column>
                {/* <Column field="" header = ""></Column>
                <Column field="" header = ""></Column>
                <Col */}
                {/* <Column field="auctionId" header="Auction ID" /> */}
                {/* <Column header="Action" body={actionButtons} /> */}


              </DataTable>
            ) : (
              <p>No currentPlayers</p>
            )
          }

        </Collapsible>
      </div>
    </div>
  );

};

export default TeamAuctionDetails;
