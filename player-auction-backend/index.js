import express from 'express';
import cors from 'cors';
import oracledb from 'oracledb';
import bcrypt from 'bcrypt';
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;


// Connection Configuration
const dbConfig = {
    user: 'AUCTION',
    password: '12345',
    connectString: 'localhost/orclpdb'
};


app.post("/login", async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const result = await loginUser(email, password, role);
        if (result) {
            const userInfo = await getUserInfo(role, email); // Fetch user information
            // console.log(userInfo);
            if (userInfo) {
                // ////console.log("I am here");
                res.json({ message: 'Login successful', user: userInfo }); // Change 'userInfo' to 'user'
            } else {
                res.json({ message: 'User information not found' });
            }
        } else {
            res.json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Function to fetch team
app.get("/team", async (req, res) => {
    const { teamId } = req.query;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const teamQuery = `SELECT * FROM Team WHERE Id = :teamId`;
        const teamResult = await connection.execute(teamQuery, { teamId });
        const team = teamResult.rows[0];
        connection.close();
        res.json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get("/bidManager", async (req, res) => {
    const { bidManagerId } = req.query;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const bidManagerQuery = `SELECT * FROM Bid_Manager WHERE Id = :bidManagerId`;
        const bidManagerResult = await connection.execute(bidManagerQuery, { bidManagerId });
        const bidManager = bidManagerResult.rows[0];
        connection.close();
        res.json(bidManager);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Function to fetch player
app.get("/player", async (req, res) => {
    const { playerId } = req.query;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const playerQuery = `SELECT * FROM Player WHERE Id = :playerId`;
        const playerResult = await connection.execute(playerQuery, { playerId });
        const player = playerResult.rows[0];
        connection.close();
        res.json(player);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



app.get("/players", async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute('SELECT * FROM Player');
        connection.close();
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Fetch players that has status null or not accepted

app.get("/playersInvitationsZone/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;
    //////console.log(auctionId);
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // SQL query to select players who have not accepted invitations for a specific auction
        const sqlQuery = `
        SELECT P.Id,(SELECT NAME FROM PLAYER WHERE ID = P.ID) NAME ,(SELECT AGE FROM PLAYER WHERE ID = P.ID) AGE,(SELECT PLAYING_ROLE FROM PLAYER WHERE ID = P.ID) PLAYING_ROLE,(SELECT COUNTRY FROM PLAYER WHERE ID = P.ID) COUNTRY,(SELECT PHOTO FROM PLAYER WHERE ID = P.ID) PHOTO,(SELECT STATUS FROM ASSIGN_NOTIFICATIONS_FOR_PLAYERS ANFP
            WHERE ID = ANFP.PLAYER_ID AND ANFP.AUCTION_ID = :auctionId) STATUS
        FROM PLAYER P
        WHERE P.Id NOT IN
        (SELECT PA.PLAYER_ID 
        FROM PLAYER_IN_AUCTION PA
        WHERE PA.AUCTION_ID = :auctionId)`;

        const result = await connection.execute(sqlQuery, { auctionId });

        connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
app.get("/auctionPlayers/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        const playersQuery = `
            SELECT p.*,pa.BASE_PRICE,pa.CATEGORY,pa.STATUS
            FROM Player p
            JOIN Player_In_Auction pa ON p.Id = pa.Player_Id
            WHERE pa.Auction_Id = :auctionId
        `;

        const playersResult = await connection.execute(playersQuery, { auctionId });
        const players = playersResult.rows;
        // console.log(players);
        connection.close();

        res.json(players);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.delete("/deleteAuction/:id", async (req, res) => {
    const auctionId = req.params.id;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check the auction status
        const checkAuctionStatusQuery = `
            SELECT Auction_Status
            FROM Auction_Details
            WHERE Id = :auctionId
        `;

        const checkStatusResult = await connection.execute(checkAuctionStatusQuery, { auctionId });

        if (checkStatusResult.rows.length === 0) {
            connection.close();
            return res.status(404).json({ error: 'Auction not found' });
        }

        const auctionStatus = checkStatusResult.rows[0]['AUCTION_STATUS'];

        if (auctionStatus !== 'Future') {
            connection.close();
            return res.status(403).json({ error: 'Only auctions with status "Future" can be deleted' });
        }

        // If the auction status is "Future," proceed with the deletion
        const deleteAuctionQuery = `
            BEGIN
                DELETE_AUCTION(:auctionId);
            END;
        `;

        const bindVars = {
            auctionId: auctionId
        };

        await connection.execute(deleteAuctionQuery, bindVars);

        // Respond with success
        res.json({ message: 'Auction deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get("/teamsInvitationsZone/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;
    // console.log(auctionId);
    try {
        const connection = await oracledb.getConnection(dbConfig);

        //SQL query to select players who have not accepted invitations
        const sqlQuery = `
        SELECT T.Id,(SELECT NAME FROM TEAM WHERE ID = T.ID) NAME ,(SELECT LOGO FROM TEAM WHERE ID = T.ID) LOGO,(SELECT STATUS FROM ASSIGN_NOTIFICATIONS_FOR_TEAMS ANFT
            WHERE ID = ANFT.TEAM_ID AND ANFT.AUCTION_ID = :auctionId) STATUS
        FROM TEAM T
        WHERE T.Id NOT IN
        (SELECT TA.TEAM_ID 
        FROM TEAM_IN_AUCTION TA
        WHERE TA.AUCTION_ID = :auctionId)
           
    `;


        const result = await connection.execute(sqlQuery, { auctionId });

        connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get("/bidManagersInvitationsZone/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        //SQL query to select players who have not accepted invitations
        const sqlQuery = `
        SELECT B.Id,(SELECT NAME FROM BID_MANAGER WHERE ID = B.ID) NAME ,(SELECT PHOTO FROM BID_MANAGER WHERE ID = B.ID) PHOTO,(SELECT STATUS FROM ASSIGN_NOTIFICATIONS_FOR_BIDMANAGERS ANFB
            WHERE ID = ANFB.BID_MANAGER_ID AND ANFB.AUCTION_ID = :auctionId) STATUS
        FROM BID_MANAGER B
        WHERE B.Id NOT IN
        (SELECT BA.BID_MANAGER_ID 
        FROM BID_MANAGER_IN_AUCTION BA
        WHERE BA.AUCTION_ID = :auctionId)
    `;

        const result = await connection.execute(sqlQuery, { auctionId });

        connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Endpoint to assign a player to an auction and send a notification
// Endpoint to assign a player to an auction and send a notification
// app.post("/assignPlayerToAuction", async (req, res) => {
//     const { playerId, auctionId, basePrice, category } = req.body;
//     // console.log(playerId, auctionId, basePrice, category);
//     try {
//         // Insert notification for the player with base price and category
//         await insertNotification(playerId, auctionId, basePrice, category);
//         res.json({ message: 'Notification sent to player' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred' });
//     }
// });

// Endpoint to assign a team to an auction and send a notification
// app.post("/assignTeamToAuction", async (req, res) => {
//     const { teamId, auctionId } = req.body;
//     console.log(`Team ID: ${teamId}, Auction ID: ${auctionId}`);
//     try {
//         // Insert notification for the team
//         await insertTeamNotification(teamId, auctionId);

//         res.json({ message: 'Notification sent to team' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred' });
//     }
// });
// Function to insert notification for team //Implemented
async function insertTeamNotification(teamId, auctionId, totalPlayers) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Generate a new notification ID based on the maximum existing ID
        const notificationIdQuery = `
            SELECT NVL(MAX(notification_id), 0) + 1 AS new_notification_id FROM Assign_Notifications_For_Teams
        `;

        const { rows } = await connection.execute(notificationIdQuery);
        const newNotificationId = rows[0].NEW_NOTIFICATION_ID;

        const notificationInsertQuery = `
            INSERT INTO Assign_Notifications_For_Teams (notification_id, Team_Id, Auction_Id, Status, Total_Player)
            VALUES (:notificationId, :teamId, :auctionId, 'pending', :totalPlayers)
        `;

        const bindVars = {
            notificationId: { val: newNotificationId, dir: oracledb.BIND_IN },
            teamId: { val: teamId, dir: oracledb.BIND_IN },
            auctionId: { val: auctionId, dir: oracledb.BIND_IN },
            totalPlayers: { val: totalPlayers, dir: oracledb.BIND_IN }
        };

        await connection.execute(notificationInsertQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}



// To undo 

app.delete("/undoTeamInvitation", async (req, res) => {
    const { teamId, auctionId } = req.query;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check if the invitation exists and has a 'pending' status
        const checkInvitationQuery = `
            SELECT *
            FROM Assign_Notifications_For_Teams
            WHERE Team_Id = :teamId AND Auction_Id = :auctionId AND Status = 'pending'
        `;

        const checkResult = await connection.execute(checkInvitationQuery, { teamId, auctionId });

        if (checkResult.rows.length == 0) {
            // Invitation not found or not in 'pending' status
            connection.close();
            return res.status(400).json({ error: 'Invalid invitation or invitation is not pending' });
        }

        // Delete the invitation
        const deleteInvitationQuery = `
            DELETE FROM Assign_Notifications_For_Teams
            WHERE Team_Id = :teamId AND Auction_Id = :auctionId
        `;

        await connection.execute(deleteInvitationQuery, { teamId, auctionId });

        connection.commit();
        connection.close();

        res.json({ message: 'Invitation undone successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.delete("/undoPlayerInvitation", async (req, res) => {
    //////console.log(req.query);
    const { playerId, auctionId } = req.query;
    //////console.log(playerId, auctionId);

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check if the invitation exists and has a 'pending' status
        const checkInvitationQuery = `
            SELECT *
            FROM Assign_Notifications_For_Players
            WHERE Player_Id = :playerId AND Auction_Id = :auctionId AND Status = 'pending'
        `;

        const checkResult = await connection.execute(checkInvitationQuery, { playerId, auctionId });

        if (checkResult.rows.length == 0) {
            // Invitation not found or not in 'pending' status
            connection.close();
            return res.status(400).json({ error: 'Invalid invitation or invitation is not pending' });
        }

        // Delete the invitation
        const deleteInvitationQuery = `
            DELETE FROM Assign_Notifications_For_Players
            WHERE Player_Id = :playerId AND Auction_Id = :auctionId
        `;

        await connection.execute(deleteInvitationQuery, { playerId, auctionId });

        connection.commit();
        connection.close();

        res.json({ message: 'Invitation undone successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Function to insert notification for the player
async function insertNotification(playerId, auctionId, basePrice, category) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        console.log(playerId, auctionId, basePrice, category);
        // Generate a new notification ID based on the maximum existing ID
        const notificationIdQuery = `
            SELECT NVL(MAX(notification_id), 0) + 1 AS new_notification_id FROM Assign_Notifications_For_Players
        `;

        const { rows } = await connection.execute(notificationIdQuery);
        const newNotificationId = rows[0].NEW_NOTIFICATION_ID;

        const notificationInsertQuery = `
            INSERT INTO Assign_Notifications_For_Players (notification_id, Player_Id, Auction_Id, Base_Price, Category, Status)
            VALUES (:notificationId, :playerId, :auctionId, :basePrice, :category, 'pending')
        `;

        const bindVars = {
            notificationId: { val: newNotificationId, dir: oracledb.BIND_IN },
            playerId: { val: playerId, dir: oracledb.BIND_IN },
            auctionId: { val: auctionId, dir: oracledb.BIND_IN },
            basePrice: { val: basePrice, dir: oracledb.BIND_IN },
            category: { val: category, dir: oracledb.BIND_IN }
        };
        await connection.execute(notificationInsertQuery, bindVars);
        console.log(bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function checkExistingNotification(playerId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const checkQuery = `
            SELECT *
            FROM Assign_Notifications_For_Players
            WHERE Player_Id = :playerId
            AND Auction_Id = :auctionId
        `;

        const bindVars = {
            playerId: playerId,
            auctionId: auctionId,
        };

        const result = await connection.execute(checkQuery, bindVars);
        connection.close();

        if (result.rows.length > 0) {

            // Return the existing notification
            return result.rows[0];
        } else {
            // No existing notification found
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}


async function checkExistingNotificationForTeam(teamId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const checkQuery = `
            SELECT *
            FROM Assign_Notifications_For_Teams
            WHERE team_Id = :teamId
            AND Auction_Id = :auctionId
        `;

        const bindVars = {
            teamId: teamId,
            auctionId: auctionId,
        };

        const result = await connection.execute(checkQuery, bindVars);
        connection.close();

        if (result.rows.length > 0) {

            // Return the existing notification
            return result.rows[0];
        } else {
            // No existing notification found
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}
app.post("/assignPlayerToAuction", async (req, res) => {
    const { playerId, auctionId, basePrice, category } = req.body;

    try {
        // Check if the player already has a notification for the specified auction

        const existingNotification = await checkExistingNotification(playerId, auctionId);

        if (existingNotification) {
            console.log('dhuklam');
            // Update the existing notification status to "pending"
            await updateNotificationStatus(playerId, auctionId, 'pending', basePrice, category);
        } else {
            // Insert a new notification for the player with base price and category
            await insertNotification(playerId, auctionId, basePrice, category);
        }

        res.json({ message: 'Notification sent to player' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.post("/assignTeamToAuction", async (req, res) => {
    const { teamId, auctionId, totalPlayers } = req.body; // Add 'totalPlayers' to the request body

    try {
        // Check if the team already has a notification for the specified auction
        const existingNotification = await checkExistingNotificationForTeam(teamId, auctionId);
        
        if (existingNotification) {
            // Update team notification status to "pending" and total players count
            await updateTeamNotificationStatus(teamId, auctionId, 'pending', totalPlayers);
        } else {
            // Insert notification for the team with the specified total players count
            await insertTeamNotification(teamId, auctionId, totalPlayers);
        }

        res.json({ message: 'Notification sent to team' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Fetch players for a specific auction ID
app.get("/auction/:id/players", async (req, res) => {
    const auctionId = req.params.id;//params is used to get the id from the url
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const playersQuery = `
            SELECT p.*,pa.BASE_PRICE,pa.CATEGORY
            FROM Player p
            JOIN Player_In_Auction pa ON p.Id = pa.Player_Id
            WHERE pa.Auction_Id = :auctionId
        `;
        // //////console.log(`Auction ID: ${auctionId}`);
        const playersResult = await connection.execute(playersQuery, { auctionId });
        const players = playersResult.rows;
        if (playersResult.rows.length > 0) {
            ////console.log( playersResult.rows);
            ////console.log(`currentplayers: ${playersResult.rows[0].NAME}`);
        }
        else {
            ////console.log("No players found");
        }

        connection.close();

        res.json(players);
        ////console.log(players);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Fetch teams for a specific auction ID
app.get("/auction/:id/teams", async (req, res) => {
    const auctionId = req.params.id;
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const teamsQuery = `
            SELECT t.*,
            tia.Available_Fund AS Team_Available_Fund,
                tia.Taken_Player AS Team_Taken_Player,
                tia.Total_Player AS Team_Total_Player,
                tia.Total_Fund AS Team_Total_Fund
            FROM Team t
            JOIN Team_In_Auction tia ON t.Id = tia.Team_Id
            WHERE tia.Auction_Id = :auctionId
        `;

        const teamsResult = await connection.execute(teamsQuery, { auctionId });
        const teams = teamsResult.rows;
        console.log(teamsResult.rows);
        connection.close();

        res.json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
app.get("/auctions", async (req, res) => {
    const { adminId } = req.query; // Assuming you pass the adminId as a query parameter

    if (!adminId) {
        return res.status(400).json({ error: 'Missing adminId parameter' });
    }

    try {
        const auctions = await getAuctions(adminId);
        res.json(auctions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Fetch auction details for a specific ID
app.get("/auction/:id", async (req, res) => {
    const auctionId = req.params.id;
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch auction details based on the provided auctionId
        const auctionDetailsQuery = `
            SELECT Id, Name, Type, Auction_Status
            FROM Auction_Details
            WHERE Id = :auctionId
        `;

        const auctionDetailsResult = await connection.execute(auctionDetailsQuery, { auctionId });
        connection.close();

        // Check if the auction details were found
        if (auctionDetailsResult.rows.length > 0) {
            const auctionDetails = auctionDetailsResult.rows[0];
            res.json(auctionDetails);
        } else {
            res.status(404).json({ message: 'Auction details not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Function to create a new auction in the database
app.post("/createAuction", async (req, res) => {
    const { name, type, adminId } = req.body;
    if (!name || !type || !adminId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }


    try {
        const result = await createAuction(name, type, adminId);
        if (result) {
            res.json({ message: 'Auction created successfully' });
        } else {
            res.json({ message: 'Auction creation failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }

});


// Function to create a new auction in the database
async function createAuction(name, type, adminId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        // check if auction already exists
        const verifyQuery = `SELECT COUNT(*) AS auction_count FROM Auction_Details WHERE Name = :name AND Type = :type AND Admin_Id = :adminId`;
        const verifyResult = await connection.execute(verifyQuery, { name, type, adminId });
        // ////console.log(name, type, adminId);
        const auctionCount = verifyResult.rows[0].AUCTION_COUNT;
        if (auctionCount > 0) {
            ////console.log('Auction already exists');
            return false;
        }

        // Query to insert a new auction into the Auction_Details table]
        const insertQuery = `
            BEGIN
                CREATE_AUCTION(:adminId, :name, :type );
            END;
        `;

        // //generate id
        // const countQuery = `SELECT COUNT(*) AS record_count FROM Auction_Details`;
        // const countResult = await connection.execute(countQuery);
        // const recordCount = countResult.rows[0].RECORD_COUNT;
        // const generatedId = (recordCount + 1).toString().padStart(3, '0');

        // const insertQuery = `INSERT INTO Auction_Details (ID, Name, Type, Admin_Id) VALUES (:id, :name, :type, :adminId)`;
        const bindVars = {
            // id: generatedId,
            name: name,
            type: type,
            adminId: adminId
        };
        await connection.execute(insertQuery, bindVars);
        ////console.log("Auction created");
        await connection.commit();
        connection.close();
        // ////console.log(`Auction created with ID: ${generatedId}`);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
// Function to fetch auctions for a specific adminId from the database
async function getAuctions(adminId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch auctions related to a specific adminId from the Auction_Details table
        const auctionsQuery = `
            SELECT Id, Name, Type
            FROM Auction_Details
            WHERE Admin_Id = :adminId
        `;
        ////console.log(adminId);
        const auctionsResult = await connection.execute(auctionsQuery, { adminId });
        ////console.log(auctionsResult.rows);

        connection.close();

        return auctionsResult.rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}



app.post("/register", async (req, res) => {
    const { name, email, password, role, playingRole } = req.body;

    try {
        const result = await registerUser(name, password, email, role, playingRole);

        if (result) {
            const userInfo = await getUserInfo(role, email);
            if (userInfo) {
                res.json({ message: 'Registration successful', user: userInfo });
            }

            // res.json({ message: 'Registration successful' });
        } else {
            // res.status(500).json({ error: 'Registration failed' });
            res.json({ message: 'Registration failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Assuming you have your app and database configuration set up

app.delete("/deleteAuction/:id", async (req, res) => {
    ////console.log(req.params.id)
    const auctionId = req.params.id;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const deleteAuctionQuery = `
    BEGIN
        DELETE_AUCTION(:auctionId);
    END;
`;
        const bindVars = {
            auctionId: auctionId
        };

        await connection.execute(deleteAuctionQuery, bindVars);

        // Respond with success
        res.json({ message: 'Auction deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Delete a player from an auction
app.delete("/auction/:auctionId/players/:playerId", async (req, res) => {
    const auctionId = req.params.auctionId;
    const playerId = req.params.playerId;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const removePlayerQuery = `DELETE FROM Player_In_Auction WHERE Auction_Id = :auctionId AND Player_Id = :playerId`;
        const bindVars = {
            auctionId: auctionId,
            playerId: playerId
        };
        await connection.execute(removePlayerQuery, bindVars);
        await connection.commit();
        connection.close();
        res.json({ message: 'Player removed successfully' });
        console.log("Player removed successfully");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Delete a team from an auction
app.delete("/auction/:auctionId/teams/:teamId", async (req, res) => {
    const auctionId = req.params.auctionId;
    const teamId = req.params.teamId;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const removeTeamQuery = `DELETE FROM Team_In_Auction WHERE Auction_Id = :auctionId AND Team_Id = :teamId`;
        const bindVars = {
            auctionId: auctionId,
            teamId: teamId
        };
        await connection.execute(removeTeamQuery, bindVars);
        await connection.commit();
        connection.close();
        res.json({ message: 'Team removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Delete a bid manager from an auction
app.delete("/auction/:auctionId/bidManagers/:bidManagerId", async (req, res) => {
    const auctionId = req.params.auctionId;
    const bidManagerId = req.params.bidManagerId;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const removeBidManagerQuery = `DELETE FROM Bid_Manager_In_Auction WHERE Auction_Id = :auctionId AND Bid_Manager_Id = :bidManagerId`;
        const bindVars = {
            auctionId: auctionId,
            bidManagerId: bidManagerId
        };
        await connection.execute(removeBidManagerQuery, bindVars);
        await connection.commit();
        connection.close();
        res.json({ message: 'Bid Manager removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Assign a player to an auction
app.post("/assignPlayerToAuction", async (req, res) => {
    const { playerId, auctionId, basePrice, category } = req.body;

    try {
        // Check if the player already has a notification for the specified auction

        const existingNotification = await checkExistingNotification(playerId, auctionId);

        if (existingNotification) {
            console.log('dhuklam');
            // Update the existing notification status to "pending"
            await updateNotificationStatus(playerId, auctionId, 'pending', basePrice, category);
        } else {
            // Insert a new notification for the player with base price and category
            await insertNotification(playerId, auctionId, basePrice, category);
        }

        res.json({ message: 'Notification sent to player' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



async function getUserInfo(role, email) {
    try {
        let tableName = '';

        // Determine the table name based on the selected role
        switch (role) {
            case 'admin':
                tableName = 'Admin';
                break;
            case 'team':
                tableName = 'Team';
                break;
            case 'player':
                tableName = 'Player';
                break;
            case 'bidmanager':
                tableName = 'Bid_Manager';
                break;
            default:
                return null;
        }

        const connection = await oracledb.getConnection(dbConfig);

        // Retrieve the user's information
        const userInfoQuery = `SELECT * FROM ${tableName} WHERE Mail = :email`;
        const userInfoResult = await connection.execute(userInfoQuery, { email });
        const userInfo = userInfoResult.rows[0];
        // add table name to the user info
        userInfo.Role = tableName;

        console.log(userInfo);
        // ////console.log("Iaaa");

        connection.close();
        return userInfo;
    } catch (error) {
        console.error(error);
        return null;
    }
}



const saltRounds = 10; // Number of salt rounds (higher is more secure)

// Function to hash a password
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw error;
  }
}

async function registerUser(name, password, email, role, playingRole) {
    try {
        let tableName = '';
        let additionalData = {};

        // Determine the table name and additional data based on the selected role
        switch (role) {
            case 'admin':
                tableName = 'Admin';
                additionalData.Mail = email;
                break;
            case 'team':
                tableName = 'Team';
                // Additional data for the Team table
                additionalData.Mail = email;
                additionalData.Logo = ''; // Set your default value here
                
                break;
            case 'player':
                tableName = 'Player';
                // Additional data for the Player table
                additionalData.Photo = ''; // Set your default value here
                additionalData.playing_role = playingRole;
                additionalData.Mail = email;
                break;
            case 'bidmanager':
                tableName = 'Bid_Manager';
                additionalData.Mail = email;
                additionalData.Photo = ''; // Set your default value here (empty string)
                break;
            default:
                return false;
        }

        const connection = await oracledb.getConnection(dbConfig);

        // Hash the password before storing it
        const hashedPassword = await hashPassword(password); // Use your hashPassword function

        // Get the current number of records in the table
        const countQuery = `SELECT COUNT(*) AS record_count FROM ${tableName}`;
        const countResult = await connection.execute(countQuery);
        const recordCount = countResult.rows[0].RECORD_COUNT;

        // Generate the ID as a 3-digit padded string
        const generatedId = (recordCount + 1).toString().padStart(3, '0');

        // Verify if the user with the same email already exists
        // const verifyQuery = `SELECT COUNT(*) AS user_count FROM ${tableName} WHERE Mail = :email AND Name = :name`;
        let verifyQuery;
        let verifyResult;
        console.log(`role: ${role}, tableName: ${tableName}, email: ${email}, name: ${name}`);
        if(role == 'team'){
             verifyQuery = `SELECT COUNT(*) AS user_count FROM ${tableName} WHERE Mail = :email OR Name = :name`;
             verifyResult = await connection.execute(verifyQuery, { email, name });
            }
            else{
                verifyQuery = `SELECT COUNT(*) AS user_count FROM ${tableName} WHERE Mail = :email`;
                verifyResult = await connection.execute(verifyQuery, { email });
        }
        // console.log(`i am here ${verifyQuery}`);
        
        console.log("I am here");
        const userCount = verifyResult.rows[0].USER_COUNT;

        if (userCount > 0) {
            // User already exists
            return false;
        }
    
        // Construct the INSERT query
        const insertQuery = `INSERT INTO ${tableName} (ID, Name, Password, ${Object.keys(additionalData).join(', ')})
        VALUES (:id, :name, :password, ${Object.keys(additionalData).map(key => `:${key}`).join(', ')})`;

        const bindVars = {
            id: generatedId,
            name: name,
            password: hashedPassword, // Store the hashed password
            ...additionalData
        };

        // Execute the INSERT query
        await connection.execute(insertQuery, bindVars);
        // Commit the transaction
        await connection.commit();

        connection.close();

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}


async function loginUser(email, password, role) {
    try {
        let tableName = '';

        // Determine the table name based on the selected role
        switch (role) {
            case 'admin':
                tableName = 'Admin';
                break;
            case 'team':
                tableName = 'Team';
                break;
            case 'player':
                tableName = 'Player';
                break;
            case 'bidmanager':
                tableName = 'Bid_Manager';
                break;
            default:
                return false;
        }

        const connection = await oracledb.getConnection(dbConfig);
        // Check if the user exists
        const getUserQuery = `SELECT Password FROM ${ tableName } WHERE Mail = : email`;
        const userResult = await connection.execute(getUserQuery, { email });
        connection.close();

        if (userResult.rows.length === 0) {
            // User not found
            return false;
        }

        const hashedPassword = userResult.rows[0].PASSWORD;

        // Compare the hashed password with the provided password
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (passwordMatch) {
            // Passwords match, login successful
            return true;
        } else {
            // Passwords do not match
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

// ...

// Endpoint to fetch notifications for a specific player
app.get('/getNotifications', async (req, res) => {
    const playerId = req.query.playerId;
    ////console.log(playerId);
    try {
        const notifications = await getAllNotifications(playerId);
        res.json(notifications);
        ////console.log(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Function to fetch notifications for a specific player

async function getAllNotifications(playerId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const notificationQuery = `
        SELECT Notification_Id, Auction_Id,
        (SELECT NAME FROM AUCTION_DETAILS WHERE ID = AUCTION_ID) AUCTION_NAME,
        (SELECT TYPE FROM AUCTION_DETAILS WHERE ID = AUCTION_ID) AUCTION_TYPE, Base_Price, Category, Status
        FROM Assign_Notifications_For_Players
        WHERE Player_Id = :playerId AND Status = 'pending'
      `;

        const bindVars = {
            playerId: { val: playerId },
        };

        const result = await connection.execute(notificationQuery, bindVars);
        connection.close();

        const notifications = result.rows.map((row) => ({
            notificationID: row.NOTIFICATION_ID,
            auctionId: row.AUCTION_ID,
            auctionName: row.AUCTION_NAME,
            basePrice: row.BASE_PRICE,
            category: row.CATEGORY,
            status: row.STATUS,
            auctionType: row.AUCTION_TYPE
        }));
        //   ////console.log(notifications);
        return notifications;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
//to get notification of a player and a particular auction
app.get('/getNotification', async (req, res) => {
    const { playerId, auctionId } = req.query;

    try {
        const notificationInfo = await getNotificationInfo(playerId, auctionId);
        if (notificationInfo) {
            res.json(notificationInfo);
        } else {
            res.status(404).json({ error: 'Notification not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Function to fetch notification for a specific player and auction
async function getNotificationInfo(playerId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const notificationQuery = `
            SELECT Base_Price, Category
            FROM Assign_Notifications_For_Players
            WHERE Player_Id = :playerId AND Auction_Id = :auctionId
        `;

        const bindVars = {
            playerId: { val: playerId },
            auctionId: { val: auctionId }
        };

        const result = await connection.execute(notificationQuery, bindVars);
        connection.close();

        if (result.rows.length > 0) {
            return {
                basePrice: result.rows[0].BASE_PRICE,
                category: result.rows[0].CATEGORY
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}


app.get('/getTeamNotifications', async (req, res) => {

    const teamId = req.query.teamId;
    // ////console.log(teamId);
    try {
        const notifications = await getAllTeamNotifications(teamId);
        res.json(notifications);
        // ////console.log(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get('/getBidManagerNotifications', async (req, res) => {
    const bidManagerId = req.query.bidManagerId;
    try {
        const notifications = await getAllBidManagerNotifications(bidManagerId);
        res.json(notifications);
        // ////console.log(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


async function getAllTeamNotifications(teamId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        ////console.log(teamId)
        const notificationQuery = `
        SELECT Notification_Id, Auction_Id, (SELECT NAME FROM AUCTION_DETAILS WHERE ID = Auction_Id) AUCTION_NAME, 
        (SELECT TYPE FROM AUCTION_DETAILS WHERE ID = Auction_Id) AUCTION_TYPE, Status, Total_Player as Total_Players
            FROM Assign_Notifications_For_Teams
            WHERE Team_Id = :teamId AND Status = 'pending'
        `;
        // ////console.log(teamId);
        const bindVars = {
            teamId: { val: teamId },
        };

        const result = await connection.execute(notificationQuery, bindVars);
        connection.close();

        const notifications = result.rows.map((row) => ({
            notificationID: row.NOTIFICATION_ID,
            auctionId: row.AUCTION_ID,
            auctionName: row.AUCTION_NAME,
            auctionType: row.AUCTION_TYPE,
            // auctionId: row.AUCTION_ID,
            status: row.STATUS,
            totalPlayers: row.TOTAL_PLAYERS
        }));
        // ////console.log(notifications);
        return notifications;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getAllBidManagerNotifications(bidManagerId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const notificationQuery = `
        SELECT Notification_Id, Auction_Id, (SELECT NAME FROM AUCTION_DETAILS WHERE ID = Auction_Id) AUCTION_NAME, (SELECT TYPE FROM AUCTION_DETAILS WHERE ID = Auction_Id) AUCTION_TYPE, Status
            FROM Assign_Notifications_For_BidManagers
            WHERE Bid_Manager_Id = :bidManagerId AND Status = 'pending'
        `;

        const bindVars = {
            bidManagerId: { val: bidManagerId },
        };

        const result = await connection.execute(notificationQuery, bindVars);
        connection.close();

        const notifications = result.rows.map((row) => ({
            notificationID: row.NOTIFICATION_ID,
            auctionId: row.AUCTION_ID,
            auctionName: row.AUCTION_NAME,
            auctionType: row.AUCTION_TYPE,
            status: row.STATUS,
        }));
        // ////console.log(notifications);
        return notifications;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Endpoint to fetch notifications for a specific team 



// Endpoint for players to respond to notifications
app.post("/playerAssignmentResponse", async (req, res) => {
    const { playerId, auctionId, response } = req.body;

    try {
        if (response === 'accept') {
            const notification = await getNotificationInfo(playerId, auctionId);
            if (notification) {
                // Insert player into Player_In_Auction table with base price and category
                await insertPlayerInAuction(playerId, auctionId, notification.basePrice, notification.category);
                // Update notification status to 'accepted'
                await updateNotificationStatus(playerId, auctionId, 'accepted');
                res.json({ message: 'Player accepted invitation and inserted into auction' });
            } else {
                res.status(400).json({ error: 'Invalid notification' });
            }
        } else if (response === 'decline') {
            // Update notification status to 'declined'
            await updateNotificationStatus(playerId, auctionId, 'declined');
            res.json({ message: 'Player declined invitation' });
        } else {
            res.status(400).json({ error: 'Invalid response' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


// Function to insert player into Player_In_Auction table
async function insertPlayerInAuction(playerId, auctionId, basePrice, category) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const insertQuery = `
            INSERT INTO Player_In_Auction (Player_Id, Auction_Id, Base_Price, Category, Status)
            VALUES (:playerId, :auctionId, :basePrice, :category, 'available')
        `;

        const bindVars = {
            playerId: { val: playerId },
            auctionId: { val: auctionId },
            basePrice: { val: basePrice },
            category: { val: category }
        };

        await connection.execute(insertQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}




// Endpoint for teams to respond to notifications
app.post("/teamAssignmentResponse", async (req, res) => {
    const { teamId, auctionId, response } = req.body;

    try {
        if (response === 'accept') {
            const notification = await getNotificationInfoForTeam(teamId, auctionId);
            if (notification) {
                const totalPlayers = notification.totalPlayers;
                console.log(totalPlayers);
                // Insert team into Team_In_Auction table
                await insertTeamInAuction(teamId, auctionId, totalPlayers);

                // Update notification status to 'accepted'
                await updateTeamNotificationStatusAfterResponse(teamId, auctionId, 'accepted');

                res.json({ message: 'Team accepted invitation and inserted into auction' });
            }
        } else if (response === 'decline') {
            // Update notification status to 'declined'
            await updateTeamNotificationStatusAfterResponse(teamId, auctionId, 'declined');

            res.json({ message: 'Team declined invitation' });
        } else {
            res.status(400).json({ error: 'Invalid response' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


async function updateTeamNotificationStatusAfterResponse(teamId, auctionId, status) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const updateQuery = `
            UPDATE Assign_Notifications_For_Teams
            SET Status = :status
            WHERE Team_Id = :teamId AND Auction_Id = :auctionId
        `;

        const bindVars = {
            status: { val: status },
            teamId: { val: teamId },
            auctionId: { val: auctionId }
        };

        await connection.execute(updateQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getNotificationInfoForTeam(teamId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const notificationQuery = `
        SELECT 
            (SELECT Name FROM Auction_Details WHERE Id = :auctionId) AS Auction_Name, 
            Total_Player AS Total_Players
        FROM Assign_Notifications_For_Teams
        WHERE Team_Id = :teamId AND Auction_Id = :auctionId
    `;

        const bindVars = {
            teamId: { val: teamId, type: oracledb.NUMBER },
            auctionId: { val: auctionId, type: oracledb.NUMBER }
        };

        const result = await connection.execute(notificationQuery, bindVars);
        connection.close();

        if (result.rows.length > 0) {
            return {
                auctionName: result.rows[0].AUCTION_NAME,
                totalPlayers: result.rows[0].TOTAL_PLAYERS
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Function to insert team into Team_In_Auction table //MODIFIED
async function insertTeamInAuction(teamId, auctionId, totalPlayers) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        console.log(totalPlayers);

        const insertQuery = `
            INSERT INTO Team_In_Auction (Team_Id, Auction_Id, Taken_Player, Total_Player, Available_Fund, Total_Fund)
            VALUES (:teamId, :auctionId, 0, :totalPlayers, 0, 0)
        `;

        const bindVars = {
            teamId: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: teamId },
            auctionId: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: auctionId },
            totalPlayers: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: totalPlayers }
        };

        await connection.execute(insertQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}



// Function to update team notification status
async function updateTeamNotificationStatus(teamId, auctionId, status, totalPlayers) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const updateQuery = `
            UPDATE Assign_Notifications_For_Teams
            SET Status = :status, Total_Player = :totalPlayers
            WHERE Team_Id = :teamId AND Auction_Id = :auctionId
        `;

        const bindVars = {
            status: { val: status },
            totalPlayers: { val: totalPlayers },
            teamId: { val: teamId },
            auctionId: { val: auctionId }
        };

        await connection.execute(updateQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}


// Function to update notification status
async function updateNotificationStatus(playerId, auctionId, status, basePrice, category) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const updateQuery = `
        UPDATE Assign_Notifications_For_Players
        SET Status = :status, Base_Price = :basePrice, Category = :category
        WHERE Player_Id = :playerId AND Auction_Id = :auctionId
    `;


        const bindVars = {
            status: { val: status, dir: oracledb.BIND_IN },
            basePrice: { val: basePrice, dir: oracledb.BIND_IN },
            category: { val: category, dir: oracledb.BIND_IN },
            playerId: { val: playerId, dir: oracledb.BIND_IN },
            auctionId: { val: auctionId, dir: oracledb.BIND_IN }
        };



        await connection.execute(updateQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}




// Endpoint for bid managers to respond to notifications
app.post("/bidManagerAssignmentResponse", async (req, res) => {
    const { bidManagerId, auctionId, response } = req.body;

    try {
        if (response === 'accept') {
            const notification = await getNotificationInfoForBidManager(bidManagerId, auctionId);
            if (notification) {
                // Update bid manager notification status to 'accepted'
                await updateBidManagerNotificationStatus(bidManagerId, auctionId, 'accepted');

                // Insert bid manager into Bid_Manager_In_Auction table
                await insertBidManagerInAuction(bidManagerId, auctionId);

                res.json({ message: 'Bid manager accepted invitation and inserted into auction' });
            }
        } else if (response === 'decline') {
            // Update bid manager notification status to 'declined'
            await updateBidManagerNotificationStatus(bidManagerId, auctionId, 'declined');

            res.json({ message: 'Bid manager declined invitation' });
        } else {
            res.status(400).json({ error: 'Invalid response' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



async function getNotificationInfoForBidManager(bidManagerId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const notificationQuery = `
        SELECT Auction_Id, 
        (SELECT Name FROM Auction_Details WHERE Id = :auctionId) AS Auction_Name
 FROM Assign_Notifications_For_BidManagers
 WHERE Bid_Manager_Id = :bidManagerId AND Auction_Id = :auctionId
`;

        const bindVars = {
            bidManagerId: { val: bidManagerId },
            auctionId: { val: auctionId }
        };

        const result = await connection.execute(notificationQuery, bindVars);
        connection.close();

        if (result.rows.length > 0) {
            return {
                auctionName: result.rows[0].AUCTION_NAME
            };

        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}



async function updateBidManagerNotificationStatus(bidManagerId, auctionId, status) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const updateQuery = `
            UPDATE Assign_Notifications_For_BidManagers
            SET Status = :status
            WHERE Bid_Manager_Id = :bidManagerId AND Auction_Id = :auctionId
        `;

        const bindVars = {
            status: { val: status },
            bidManagerId: { val: bidManagerId },
            auctionId: { val: auctionId }
        };

        await connection.execute(updateQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}



// // Function to insert notification for the bid manager
// async function insertBidManagerNotification(bidManagerId, auctionId) {
//     try {
//         const connection = await oracledb.getConnection(dbConfig);

//         // Generate a new notification ID based on the maximum existing ID
//         const notificationIdQuery = `
//             SELECT NVL(MAX(Notification_Id), 0) + 1 AS new_notification_id FROM Assign_Notifications_For_BidManagers
//         `;

//         const { rows } = await connection.execute(notificationIdQuery);
//         const newNotificationId = rows[0].NEW_NOTIFICATION_ID;

//         const notificationInsertQuery = `
//             INSERT INTO Assign_Notifications_For_BidManagers (Notification_Id, Bid_Manager_Id, Auction_Id, Status)
//             VALUES (:notificationId, :bidManagerId, :auctionId, 'pending')
//         `;

//         const bindVars = {
//             notificationId: { val: newNotificationId, dir: oracledb.BIND_IN },
//             bidManagerId: { val: bidManagerId, dir: oracledb.BIND_IN },
//             auctionId: { val: auctionId, dir: oracledb.BIND_IN }
//         };

//         await connection.execute(notificationInsertQuery, bindVars);
//         await connection.commit();

//         connection.close();
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// }



app.get("/pastAuctions", async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch past auctions
        const pastAuctionsQuery = `
            SELECT *
            FROM Auction_Details
            WHERE Auction_Status = 'Past'
        `;

        const result = await connection.execute(pastAuctionsQuery, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.get("/currentAuctions", async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch current auctions
        const getCurrentAuctionsQuery = `
            SELECT Id, Name, Type, Auction_Status
            FROM Auction_Details
            WHERE Auction_Status = 'Current'
        `;

        const result = await connection.execute(getCurrentAuctionsQuery, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        connection.close();

        // Respond with the list of current auctions
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.get("/upcomingAuctions", async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch future auctions
        const futureAuctionsQuery = `
            SELECT Id, Name, Type, Auction_Status
            FROM Auction_Details
            WHERE Auction_Status = 'Future'
        `;

        const result = await connection.execute(futureAuctionsQuery, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



app.put("/updateAuctionStatus/:id", async (req, res) => {
    const auctionId = req.params.id;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check if the auction status is currently "Future" or "Current"
        const checkAuctionStatusQuery = `
            SELECT Auction_Status
            FROM Auction_Details
            WHERE Id = :auctionId
        `;

        const statusResult = await connection.execute(checkAuctionStatusQuery, { auctionId });

        if (statusResult.rows.length === 0) {
            connection.close();
            return res.status(404).json({ error: 'Auction not found' });
        }

        const currentStatus = statusResult.rows[0]['AUCTION_STATUS'];

        // Call the PL/SQL function to update the auction status based on the current status
        let updateStatusFunction;
        if (currentStatus === 'Future') {
            updateStatusFunction = `BEGIN :result := UpdateAuctionStatusToCurrent(:auctionId); END;`;
        } else if (currentStatus === 'Current') {

            updateStatusFunction = `BEGIN :result := UpdateAuctionStatusToPast(:auctionId); END;`;
        } else {
            connection.close();
            return res.status(400).json({ error: 'Invalid auction status' });
        }

        const updateStatusBinds = {
            result: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
            auctionId: auctionId,
        };

        const updateStatusResult = await connection.execute(updateStatusFunction, updateStatusBinds);

        if (updateStatusResult.outBinds.result === 1) {
            // Commit the transaction
            await connection.commit();

            connection.close();

            // Respond with success
            res.json({ message: `Auction status updated to "${currentStatus === 'Future' ? 'Current' : 'Past'}" successfully` });
        } else {
            // Transaction failed
            connection.close();
            res.status(500).json({ error: 'Failed to update auction status' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



// Function to insert notification for the bid manager
async function insertBidManagerNotification(bidManagerId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Generate a new notification ID based on the maximum existing ID
        const notificationIdQuery = `
            SELECT NVL(MAX(Notification_Id), 0) + 1 AS new_notification_id FROM Assign_Notifications_For_BidManagers
        `;

        const { rows } = await connection.execute(notificationIdQuery);
        const newNotificationId = rows[0].NEW_NOTIFICATION_ID;

        const notificationInsertQuery = `
            INSERT INTO Assign_Notifications_For_BidManagers (Notification_Id, Bid_Manager_Id, Auction_Id, Status)
            VALUES (:notificationId, :bidManagerId, :auctionId, 'pending')
        `;

        const bindVars = {
            notificationId: { val: newNotificationId, dir: oracledb.BIND_IN },
            bidManagerId: { val: bidManagerId, dir: oracledb.BIND_IN },
            auctionId: { val: auctionId, dir: oracledb.BIND_IN }
        };

        await connection.execute(notificationInsertQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function checkExistingNotificationForBidManager(bidManagerId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const checkQuery = `
            SELECT *
            FROM Assign_Notifications_For_BidManagers
            WHERE Bid_Manager_Id = :bidManagerId
            AND Auction_Id = :auctionId
        `;

        const bindVars = {
            bidManagerId: bidManagerId,
            auctionId: auctionId,
        };

        const result = await connection.execute(checkQuery, bindVars);
        connection.close();

        if (result.rows.length > 0) {

            // Return the existing notification
            return result.rows[0];
        } else {
            // No existing notification found
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

app.post("/assignBidManagerToAuction", async (req, res) => {
    const { bidManagerId, auctionId } = req.body;
    console.log(bidManagerId, auctionId);
    try {
        const existingNotification = await checkExistingNotificationForBidManager(bidManagerId, auctionId);
        if (existingNotification) {
            await updateBidManagerNotificationStatus(bidManagerId, auctionId, 'pending');
        } else {
            // Insert notification for the bid manager
            await insertBidManagerNotification(bidManagerId, auctionId);
        }
        res.json({ message: 'Notification sent to bid manager' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.delete("/undoBidManagerInvitation", async (req, res) => {
    const { bidManagerId, auctionId } = req.query;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check if the invitation exists and has a 'pending' status
        const checkInvitationQuery = `
            SELECT *
            FROM Assign_Notifications_For_BidManagers
            WHERE Bid_Manager_Id = :bidManagerId AND Auction_Id = :auctionId AND Status = 'pending'
        `;

        const checkResult = await connection.execute(checkInvitationQuery, { bidManagerId, auctionId });

        if (checkResult.rows.length === 0) {
            // Invitation not found or not in 'pending' status
            connection.close();
            return res.status(400).json({ error: 'Invalid invitation or invitation is not pending' });
        }

        // Delete the invitation
        const deleteInvitationQuery = `
            DELETE FROM Assign_Notifications_For_BidManagers
            WHERE Bid_Manager_Id = :bidManagerId AND Auction_Id = :auctionId
        `;

        await connection.execute(deleteInvitationQuery, { bidManagerId, auctionId });

        connection.commit();
        connection.close();

        res.json({ message: 'Invitation undone successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Endpoint to get bid managers in a specific auction
app.get("/auctionBidManagers/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        const bidManagersQuery = `
            SELECT bm.*
            FROM Bid_Manager bm
            JOIN Bid_Manager_In_Auction bma ON bm.Id = bma.Bid_Manager_Id
            WHERE bma.Auction_Id = :auctionId
        `;

        const bidManagersResult = await connection.execute(bidManagersQuery, { auctionId });
        const bidManagers = bidManagersResult.rows;

        connection.close();
        console.log(bidManagers);
        res.json(bidManagers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


// Endpoint for bid managers to respond to notifications
app.post("/BidManagerAuctionsignmentResponse", async (req, res) => {
    const { bidManagerId, auctionId, response } = req.body;

    try {
        if (response === 'accept') {
            const notification = await getNotificationInfoForBidManager(bidManagerId, auctionId);
            if (notification) {
                // Update bid manager notification status to 'accepted'
                await updateBidManagerNotificationStatus(bidManagerId, auctionId, 'accepted');

                // Insert bid manager into Bid_Manager_In_Auction table
                await insertBidManagerInAuction(bidManagerId, auctionId);

                res.json({ message: 'Bid manager accepted invitation and inserted into auction' });
            }
        } else if (response === 'decline') {
            // Update bid manager notification status to 'declined'
            await updateBidManagerNotificationStatus(bidManagerId, auctionId, 'declined');

            res.json({ message: 'Bid manager declined invitation' });
        } else {
            res.status(400).json({ error: 'Invalid response' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


// async function getNotificationInfoForBidManager(bidManagerId, auctionId) {
//     try {
//         const connection = await oracledb.getConnection(dbConfig);

//         const notificationQuery = `
//         SELECT Auction_Id, 
//         (SELECT Name FROM Auction_Details WHERE Id = :auctionId) AS Auction_Name
//  FROM Assign_Notifications_For_BidManagers
//  WHERE Bid_Manager_Id = :bidManagerId AND Auction_Id = :auctionId
// `;

//         const bindVars = {
//             bidManagerId: { val: bidManagerId },
//             auctionId: { val: auctionId }
//         };

//         const result = await connection.execute(notificationQuery, bindVars);
//         connection.close();

//         if (result.rows.length > 0) {
//             return {
//                 auctionName: result.rows[0].AUCTION_NAME
//             };

//         } else {
//             return null;
//         }
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// }


// // Function to update bid manager notification status
// async function updateBidManagerNotificationStatus(bidManagerId, auctionId, status) {
//     try {
//         const connection = await oracledb.getConnection(dbConfig);

//         const updateQuery = `
//             UPDATE Assign_Notifications_For_BidManagers
//             SET Status = :status
//             WHERE Bid_Manager_Id = :bidManagerId AND Auction_Id = :auctionId
//         `;

//         const bindVars = {
//             status: { val: status },
//             bidManagerId: { val: bidManagerId },
//             auctionId: { val: auctionId }
//         };

//         await connection.execute(updateQuery, bindVars);
//         await connection.commit();

//         connection.close();
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// }

// Function to insert bid manager into Bid_Manager_In_Auction table
async function insertBidManagerInAuction(bidManagerId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const insertQuery = `
            INSERT INTO Bid_Manager_In_Auction (Bid_Manager_Id, Auction_Id)
            VALUES (:bidManagerId, :auctionId)
        `;

        const bindVars = {
            bidManagerId: { val: bidManagerId },
            auctionId: { val: auctionId }
        };

        await connection.execute(insertQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//////////////BIDDING ER KAAJ SHURU/////////////////////

//info about the player who is now currently in that bid
app.get("/currentBiddingPlayers/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;
    console.log(auctionId);
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch players who are currently in bid for the specified auction
        const currentBiddingPlayersQuery = `
            SELECT
                p.Id AS Player_Id,
                p.Name AS Player_Name,
                p.Age AS Player_Age,
                p.Country AS Player_Country,
                p.Photo AS Player_Photo,
                b.Bidding_Price AS Bid_Price,
                pia.Base_Price AS Base_Price,
                pia.Category AS Category,
                p.playing_role AS Playing_Role,
                pia.auction_id,
                (SELECT t.Name FROM Team t WHERE t.Id = b.Team_Id) AS Team_Name
            FROM Player p
            INNER JOIN Player_In_Auction pia ON p.Id = pia.Player_Id
            INNER JOIN Bid b ON p.Id = b.Player_Id
            WHERE pia.Auction_Id = :auctionId
              AND pia.Status = 'currently in bid'
        `;

        const playersResult = await connection.execute(currentBiddingPlayersQuery, { auctionId });
        console.log(playersResult.rows);
        connection.close();

        res.json(playersResult.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


//when a player will log in then he will see the auction details of the auction he has been assigned for
// Define a route with the playerId as a URL parameter(join)
app.get("/playerAuctions", async (req, res) => {
    // Access the playerId from the URL parameters
    const playerId = req.query.playerId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch auctions associated with the player
        const getPlayerAuctionsQuery = `
            SELECT a.*
            FROM Auction_Details a
            JOIN Player_In_Auction p
            ON a.Id = p.Auction_Id
            WHERE p.Player_Id = :playerId
        `;

        const auctionsResult = await connection.execute(getPlayerAuctionsQuery, { playerId });

        connection.close();

        res.json(auctionsResult.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});




//when a team will log in then he will see the auction details of the auction he has been assigned for
// Define a route with the teamId as a URL parameter
app.get("/teamAuctions", async (req, res) => {
    // Access the teamId from the URL parameters
    const teamId = req.query.teamId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch auctions assigned to the team
        const getAuctionsForTeamQuery = `
            SELECT a.*
            FROM Auction_Details a
            JOIN Team_In_Auction t
            ON a.Id = t.Auction_Id
            WHERE t.Team_Id = :teamId
        `;

        const auctionsResult = await connection.execute(getAuctionsForTeamQuery, { teamId });

        connection.close();
        console.log(auctionsResult.rows);
        res.json(auctionsResult.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Create a route to fetch auction details for a particular bid manager.
//when a bid manager will log in then he will see the auction details of the auction he has been assigned for
app.get("/bidManagerAuctions", async (req, res) => {
    // Access the bidManagerId from the URL parameters
    const bidManagerId = req.query.bidManagerId;
    console.log(bidManagerId);
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch auctions assigned to the bid manager
        const getAuctionsForBidManagerQuery = `
            SELECT a.*
            FROM Auction_Details a
            JOIN Bid_Manager_In_Auction b
            ON a.Id = b.Auction_Id
            WHERE b.Bid_Manager_Id = :bidManagerId
        `;

        const auctionsResult = await connection.execute(getAuctionsForBidManagerQuery, { bidManagerId });
        console.log(auctionsResult.rows);
        connection.close();

        res.json(auctionsResult.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


//to see the players beside which we can put the add to bid button
app.get("/SendToBidZone/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch players with status "unsold" or "available" in the specified auction
        const getPlayersQuery = `
        SELECT 
            (SELECT NAME FROM PLAYER WHERE ID = p.PLAYER_ID) NAME,
            (SELECT PHOTO FROM PLAYER WHERE ID = p.PLAYER_ID) PHOTO,
            (SELECT PLAYING_ROLE FROM PLAYER WHERE ID = p.PLAYER_ID) PLAYING_ROLE,
            (SELECT AGE FROM PLAYER WHERE ID = p.PLAYER_ID) AGE,
            (SELECT COUNTRY FROM PLAYER WHERE ID = p.PLAYER_ID) COUNTRY, p.PLAYER_ID, p.BASE_PRICE, p.CATEGORY,p.STATUS
        FROM Player_In_Auction p
        WHERE p.Auction_Id = :auctionId
          AND p.Status IN ('unsold', 'available')
        `;

        const playersResult = await connection.execute(getPlayersQuery, { auctionId });

        connection.close();

        res.json(playersResult.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



// Endpoint to add a player to bidding and we are additionally checking if the bid manager is associated with that particular auction
app.post("/addPlayerToBid", async (req, res) => {
    const { bidManagerId, auctionId, playerId } = req.body;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check if the bid manager is associated with the auction
        const isBidManagerAssociatedQuery = `
            SELECT 1
            FROM Bid_Manager_In_Auction
            WHERE Bid_Manager_Id = :bidManagerId AND Auction_Id = :auctionId
        `;

        const isBidManagerAssociatedResult = await connection.execute(isBidManagerAssociatedQuery, { bidManagerId, auctionId });

        if (isBidManagerAssociatedResult.rows.length === 0) {
            connection.close();
            return res.status(400).json({ error: 'Bid manager is not associated with this auction' });
        }




        // Call the function to fetch and populate the Set
        fetchAuctionAndPlayerIDsFromDatabase();

        // Call the function to initialize the unsoldPlayers set
        initializeUnsoldPlayersSet();

        // Fetch the base price for the player from the Player_In_Auction table
        const getPlayerBasePriceQuery = `
            SELECT BASE_PRICE
            FROM Player_In_Auction
            WHERE Auction_Id = :auctionId AND Player_Id = :playerId
        `;

        const basePriceResult = await connection.execute(getPlayerBasePriceQuery, { auctionId, playerId });

        if (basePriceResult.rows.length == 0) {
            connection.close();
            return res.status(400).json({ error: 'Player not found for this auction' });
        }

        const basePrice = basePriceResult.rows[0]['BASE_PRICE'];

        // Assuming you have the basePrice now, proceed to insert the bid
        await insertBid(bidManagerId, auctionId, playerId, basePrice);

        connection.close();

        // Call startPeriodicChecking to resume periodic checking
        startPeriodicChecking();

        res.json({ message: 'Player added to bidding successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }

});


async function insertBid(bidManagerId, auctionId, playerId, basePrice) {
    try {
        const connection = await oracledb.getConnection(dbConfig);


        // Generate a new bid ID based on the maximum existing ID
        const bidIdQuery = `
            SELECT NVL(MAX(Id), 0) + 1 AS new_bid_id FROM Bid
        `;

        const { rows } = await connection.execute(bidIdQuery);
        const newBidId = rows[0].NEW_BID_ID;

        // Calculate the created_at and ended_at timestamps
        const currentTimestamp = new Date();
        const endedAtTimestamp = new Date(currentTimestamp);
        endedAtTimestamp.setMinutes(endedAtTimestamp.getMinutes() + 5); // Add 5 minutes

        const insertBidQuery = `
            INSERT INTO Bid (Id, Bid_Manager_Id, Auction_Id, Player_Id, Bidding_Price, Created_At, Ended_At)
            VALUES (:bidId, :bidManagerId, :auctionId, :playerId, :basePrice, :createdAt, :endedAt)
        `;

        const bindVars = {
            bidId: { val: newBidId, dir: oracledb.BIND_IN },
            bidManagerId: { val: bidManagerId, dir: oracledb.BIND_IN },
            auctionId: { val: auctionId, dir: oracledb.BIND_IN },
            playerId: { val: playerId, dir: oracledb.BIND_IN },
            basePrice: { val: basePrice, dir: oracledb.BIND_IN },
            createdAt: { val: currentTimestamp, dir: oracledb.BIND_IN, type: oracledb.DATE },
            endedAt: { val: endedAtTimestamp, dir: oracledb.BIND_IN, type: oracledb.DATE }
        };

        await connection.execute(insertBidQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Function to fetch bids from the database and add them to the Set
async function fetchAuctionAndPlayerIDs() {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const query = `
            SELECT AUCTION_ID, PLAYER_ID
            FROM Player_Distribution
        `;

        const result = await connection.execute(query);

        console.log(result.rows);

        connection.close();

        return result.rows;
    } catch (error) {
        console.error('Error fetching auction and player IDs:', error);
        throw error;
    }
}



const insertedPlayers = new Set();

// Function to fetch auction IDs and player IDs from the bid table and add them to the Set
async function fetchAuctionAndPlayerIDsFromDatabase() {
    try {
        // Replace this with your database query to fetch auction IDs and player IDs
        const auctionAndPlayerIDs = await fetchAuctionAndPlayerIDs(); // Call your database query function here
        if (auctionAndPlayerIDs.length > 0) {
            // Iterate through the fetched data and add auction ID + player ID pairs to the Set
            auctionAndPlayerIDs.forEach((row) => {
                insertedPlayers.add(`${row.PLAYER_ID}-${row.AUCTION_ID}`); // Combine auction ID and player ID
            });

            //console.log('Inserted auction and player IDs:', insertedPlayers);
        }
    } catch (error) {
        console.error('Error fetching auction and player IDs:', error);
    }
}


const unsoldPlayers = new Set(); // Initialize an empty Set

async function initializeUnsoldPlayersSet() {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to retrieve players with "unsold" status from Player_In_Auction
        const unsoldPlayersQuery = `
            SELECT player_id, auction_id
            FROM Player_In_Auction
            WHERE status = 'unsold'
        `;

        const unsoldPlayersResult = await connection.execute(unsoldPlayersQuery);

        // Populate the unsoldPlayers set with player_id and auction_id pairs
        for (const row of unsoldPlayersResult.rows) {
            const { player_id, auction_id } = row;
            unsoldPlayers.add(`${row.PLAYER_ID}-${row.AUCTION_ID}`);
        }

        connection.close();
    } catch (error) {
        console.error(error);
    }
}

// Global variable to track whether the periodic checking is active
let checkingIsActive = false;
let counter = 0;



async function insertPlayersIntoDistribution() {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const binds = {
            expiredTimestamp: new Date(new Date() - 5 * 60000), // 5 minutes ago
        };



        // Find all expired bids where the team ID is not null
        const unsold_query = `
         SELECT b.auction_id, b.player_id
         FROM bid b
         WHERE  b.team_id IS NULL
           AND b.created_at <= :expiredTimestamp
     `;


        //expired case
        const unsold_result = await connection.execute(unsold_query, binds, { autoCommit: true });

        for (const row of unsold_result.rows) {
            const { auction_id, player_id } = row;


            // Check if the player has already been inserted for the same auction ID
            if (!unsoldPlayers.has(`${row.PLAYER_ID}-${row.AUCTION_ID}`)) {
                console.log('dhuksi');
                // Call the PL/SQL function to update the status to "unsold"
                const updateStatusQuery = `
             BEGIN
                 :result := UpdatePlayerStatusToUnsold(:auction_id, :player_id);
             END;
         `;

                const updateStatusBinds = {
                    result: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                    auction_id: row.AUCTION_ID,
                    player_id: row.PLAYER_ID,
                };

                const updateStatusResult = await connection.execute(updateStatusQuery, updateStatusBinds, { autoCommit: true });


                if (updateStatusResult.outBinds.result == 1) {
                    // Successfully updated player status to "unsold"
                    unsoldPlayers.add(`${row.PLAYER_ID}-${row.AUCTION_ID}`);
                }
            }
        }


        //Find all expired bids where the team ID is not null
        const query = `
            SELECT b.auction_id, b.team_id, b.player_id
            FROM bid b
            WHERE  b.team_id IS NOT NULL
              AND b.created_at <= :expiredTimestamp
        `;


        const result = await connection.execute(query, binds, { autoCommit: true });
        // counter++;
        // console.log('checking ' + counter);





        //         // Insert players into the Player_Distribution table for each expired bid
        for (const row of result.rows) {
            const { auction_id, team_id, player_id } = row;
            console.log(row);

            // Check if the player has already been inserted for the same auction ID
            if (!insertedPlayers.has(`${row.PLAYER_ID}-${row.AUCTION_ID}`)) {

                const insertDistributionQuery = `
                    INSERT INTO Player_Distribution (auction_id, team_id, player_id)
                    VALUES (:auctionId, :teamId, :playerId)
                `;

                const insertDistributionBinds = {
                    auctionId: row.AUCTION_ID,
                    teamId: row.TEAM_ID,
                    playerId: row.PLAYER_ID,
                };
                //console.log(insertDistributionBinds);

                await connection.execute(insertDistributionQuery, insertDistributionBinds, { autoCommit: true });

                // Call the PL/SQL procedure to increment Available_Player
                const incrementPlayerProcedure = `
    BEGIN
        IncrementTakenPlayer(:teamId, :auctionId);
    END;
`;

                const incrementPlayerBinds = {
                    teamId: row.TEAM_ID,
                    auctionId: row.AUCTION_ID,
                };

                await connection.execute(incrementPlayerProcedure, incrementPlayerBinds, { autoCommit: true });


                // Add the player to the set of inserted players with the auction ID
                insertedPlayers.add(`${row.PLAYER_ID}-${row.AUCTION_ID}`);
            }
        }




        const playerArray = [...unsoldPlayers];
        console.log('unsold ' + playerArray);
        const playerArraySold = [...insertedPlayers];
        console.log('sold' + playerArraySold);


        connection.close();
    } catch (error) {
        console.error(error);
    }
}
// Schedule the function to run every second (adjust the interval as needed)
let intervalId; // Variable to store the interval ID

function startPeriodicChecking() {
    if (!checkingIsActive) {
        // Start the periodic checking only if it's not already active
        intervalId = setInterval(insertPlayersIntoDistribution, 1000);
        checkingIsActive = true;
    }
}


// Endpoint for a team to place a bid on a player

app.post('/placeTeamBid', async (req, res) => {
    const { teamId, auctionId, playerId, biddingPrice } = req.body;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check if the team is participating in the specified auction
        const checkParticipationQuery = `
            SELECT 1
            FROM Team_In_Auction
            WHERE Team_Id = :teamId
              AND Auction_Id = :auctionId
        `;

        const checkParticipationBinds = {
            teamId,
            auctionId,
        };

        const participationResult = await connection.execute(checkParticipationQuery, checkParticipationBinds, { autoCommit: true });

        if (participationResult.rows.length == 0) {
            connection.close();
            return res.status(400).json({ error: 'Team is not participating in the specified auction' });
        }

        // Check if the team's available fund is sufficient for the bidding price
        const checkFundQuery = `
            SELECT Available_Fund
            FROM Team_In_Auction
            WHERE Team_Id = :teamId AND Auction_Id = :auctionId
        `;

        const checkFundBinds = {
            teamId,
            auctionId
        };

        const fundResult = await connection.execute(checkFundQuery, checkFundBinds, { autoCommit: true });

        if (fundResult.rows.length == 0) {
            connection.close();
            return res.status(400).json({ error: 'Team not found' });
        }

        const teamAvailableFund = fundResult.rows[0].AVAILABLE_FUND;

        if (biddingPrice > teamAvailableFund) {
            connection.close();
            // return res.json({ message: 'Insufficient funds for bidding' });
            return res.status(400).json({ error: 'Insufficient funds for bidding' });
        }

        // Check if the player's bid is still active (i.e., the bid has not ended)
        const checkBidQuery = `
            SELECT id, ended_at, team_id, bidding_price, auction_id
            FROM Bid
            WHERE auction_id = :auctionId
              AND player_id = :playerId 
              AND ended_at > CURRENT_TIMESTAMP
        `;

        const checkBidBinds = {
            auctionId,
            playerId
        };



        const bidResult = await connection.execute(checkBidQuery, checkBidBinds, { autoCommit: true });
        // console.log(bidResult.rows[0].AUCTION_ID);

        if (bidResult.rows.length == 0) {
            connection.close();
            // return res.json({ message: 'Player bid not found or bid has ended' });
            return res.status(400).json({ error: 'Player bid not found or bid has ended' });
        }



        const lastBidTeamId = bidResult.rows[0].TEAM_ID;
        const previousBiddingPrice = bidResult.rows[0].BIDDING_PRICE;
        const lastAuctionId = bidResult.rows[0].AUCTION_ID;

        console.log(`last bid team id ${lastBidTeamId}`);
        console.log(`last auction id ${lastAuctionId}`)
        console.log(`current team id ${teamId}`);
        console.log(`current auction id ${auctionId}`);
        console.log(lastBidTeamId == teamId && lastAuctionId == auctionId);
        // Check if the last bid for the same auction was made by the same team
        if (lastBidTeamId == teamId && lastAuctionId == auctionId) {
            console.log('same team');
            // return res.json({ message: 'Team cannot bid consecutively in the same auction' });
            connection.close();
            return res.status(400).json({ error: 'Team cannot bid consecutively in the same auction' });
        }

        // Check if the new bidding price is higher than the previous bidding price
        if (biddingPrice <= previousBiddingPrice && lastAuctionId == auctionId) {
            connection.close();
            // return res.json({ message: 'Bidding price must be higher than the previous bid' });
            return res.status(400).json({ error: 'Bidding price must be higher than the previous bid' });
        }

        // Check if the team has reached the maximum number of players it can have
        const checkPlayerLimitQuery = `
            SELECT Total_Player, Taken_Player
            FROM Team_In_Auction 
            WHERE Team_Id = :teamId AND Auction_Id = :auctionId
        `;

        const checkPlayerLimitBinds = {
            teamId,
            auctionId
        };

        const playerLimitResult = await connection.execute(checkPlayerLimitQuery, checkPlayerLimitBinds, { autoCommit: true });

        if (playerLimitResult.rows.length == 0) {
            connection.close();
            // return res.json({ message: 'Team not found' });
            return res.status(400).json({ error: 'Team not found' });
        }
        const totalPlayerLimit = playerLimitResult.rows[0].TOTAL_PLAYER;
        const takenPlayerCount = playerLimitResult.rows[0].TAKEN_PLAYER;

        if (takenPlayerCount >= totalPlayerLimit) {
            connection.close();
            // return res.json({ message: 'Team has reached the maximum number of players' });
            return res.status(400).json({ error: 'Team has reached the maximum number of players' });
        }

        // Call the PL/SQL function to update the bid
        const updateBidQuery = `BEGIN :result := updateBid(:teamId, :biddingPrice, :playerId); END;`;

        const updateBidBinds = {
            result: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
            teamId,
            biddingPrice,
            playerId
        };

        const result = await connection.execute(updateBidQuery, updateBidBinds, { autoCommit: true });

        if (result.outBinds.result == 1) {
            // Bid updated successfully
            connection.close();
            res.json({ message: 'Team bid placed successfully' });

        } else {
            // Error occurred while updating bid
            connection.close();
            res.status(500).json({ error: 'An error occurred while updating the bid' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

//it will return false if the bid count is 0 and will return false if the bid count > 0
app.get("/countBid/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to count players with status "bid" for the specified auction
        const countPlayersInBidQuery = `
            SELECT COUNT(*) AS playerCount
            FROM Player_In_Auction
            WHERE Auction_Id = :auctionId
              AND Status = 'currently in bid'
        `;

        const countResult = await connection.execute(countPlayersInBidQuery, { auctionId });

        connection.close();

        const playerCount = countResult.rows[0].PLAYERCOUNT;
        const hasPlayersInBid = playerCount > 0;

        res.json({ hasPlayersInBid });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// update player info

app.post("/updatePlayerInfo/:playerId", async (req, res) => {
    const playerId = req.params.playerId;
    const { player_name, age, mail, photo, playing_role, country } = req.body;
    
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Update player information in the Player table
        const updatePlayerQuery = `
            UPDATE Player
            SET Name = :player_name,
                Age = :age,
                Mail = :mail,
                Photo = :photo,
                Playing_Role = :playing_role,
                Country = :country
            WHERE Id = :playerId
        `;

        const bindVars = {
            player_name: { val: player_name, dir: oracledb.BIND_IN },
            age: { val: age, dir: oracledb.BIND_IN },
            mail: { val: mail, dir: oracledb.BIND_IN },
            photo: { val: photo, dir: oracledb.BIND_IN },
            playing_role: { val: playing_role, dir: oracledb.BIND_IN },
            playerId: { val: playerId, dir: oracledb.BIND_IN },
            country: { val: country, dir: oracledb.BIND_IN }
        };

        const result = await connection.execute(updatePlayerQuery, bindVars);

        connection.commit();
        connection.close();

        res.json({ message: 'Player information updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


//insert this
app.post("/updateBidManagerInfo/:bidManagerId", async (req, res) => {
    const bidManagerId = req.params.bidManagerId;
    const { mail, photo } = req.body;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Update Bid Manager information in the Bid_Manager table
        const updateBidManagerQuery = `
            UPDATE Bid_Manager
            SET Mail = :mail,
                Photo = :photo
            WHERE Id = :bidManagerId
        `;

        const bindVars = {
            mail: { val: mail, dir: oracledb.BIND_IN },
            photo: { val: photo, dir: oracledb.BIND_IN },
            bidManagerId: { val: bidManagerId, dir: oracledb.BIND_IN }
        };

        const result = await connection.execute(updateBidManagerQuery, bindVars);

        connection.commit();
        connection.close();

        res.json({ message: 'Bid Manager information updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.get("/playerSales", async (req, res) => {
    const playerId = req.query.playerId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch player sale information
        const playerSalesInfoQuery = `
            SELECT
                t.Name AS Team_Name,
                ad.Name AS Auction_Name,
                b.Bidding_Price AS Price
            FROM Bid b
            INNER JOIN Auction_Details ad ON b.Auction_Id = ad.Id
            INNER JOIN Player_Distribution pd ON b.Player_Id = pd.Player_Id
            INNER JOIN Team t ON pd.Team_Id = t.Id
            WHERE b.Player_Id = :playerId
        `;

        const bindVars = {
            playerId: { val: playerId, dir: oracledb.BIND_IN }
        };

        const playerSalesResult = await connection.execute(playerSalesInfoQuery, bindVars);

        connection.close();

        if (playerSalesResult.rows.length > 0) {
            const playerSalesInfo = playerSalesResult.rows;
            res.json(playerSalesInfo);
        } else {
            res.status(400).json({ error: 'Player sales information not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


//update the team informations
app.post("/updateTeamInfo", async (req, res) => {
    const { teamId, logo, mail } = req.body;
    console.log(`team id ${teamId}, logo ${logo}, mail ${mail}`)
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check if the team with the specified ID exists
        const teamExistsQuery = `
            SELECT 1
            FROM Team
            WHERE Id = :teamId
        `;

        const teamExistsResult = await connection.execute(teamExistsQuery, { teamId });

        if (teamExistsResult.rows.length === 0) {
            connection.close();
            return res.status(400).json({ error: 'Team not found' });
        }

        // Update team information (logo and mail)
        const updateTeamQuery = `
            UPDATE Team
            SET Logo = :logo, Mail = :mail
            WHERE Id = :teamId
        `;

        const bindVars = {
            teamId: { val: teamId, dir: oracledb.BIND_IN },
            logo: { val: logo, dir: oracledb.BIND_IN },
            mail: { val: mail, dir: oracledb.BIND_IN }
        };

        await connection.execute(updateTeamQuery, bindVars);
        await connection.commit();

        connection.close();

        res.json({ message: 'Team information updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


//(join)//will show the players who are in for a particular team//change hoye giyeche
app.get("/teamPlayers", async (req, res) => {
    const teamId = req.query.teamId;
    const auctionId = req.query.auctionId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch information about players in a specific team for a particular auction
        const teamPlayersQuery = `
        SELECT 
            p.Name AS Player_Name,
            p.Age AS Player_Age,
            p.Country AS Player_Country,
            p.Photo AS Player_Photo,
            (SELECT NAME FROM TEAM WHERE ID = :teamId) TEAM_NAME, 
            b.Bidding_Price AS Player_Bidding_Price
        FROM Player p
        JOIN Player_Distribution pd ON p.Id = pd.Player_Id
        JOIN Bid b ON p.Id = b.Player_Id AND b.Auction_Id = pd.Auction_Id
        WHERE pd.Auction_Id = :auctionId
          AND pd.Team_Id = :teamId
    
        `;

        const bindVars = {
            auctionId: { val: auctionId },
            teamId: { val: teamId }
        };

        const playersResult = await connection.execute(teamPlayersQuery, bindVars);

        connection.close();

        res.json(playersResult.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
/**   axios.get(`http://localhost:9002/getTotalFundForAuction?teamId=${teamId}&auctionId=${id}`)
      .then((res) => {
        setTotalFund(res.data);
        console.log(totalFund);
      })*/
app.get("/getTotalFundForAuction", async (req, res) => {
    const teamId = req.query.teamId;
    const auctionId = req.query.auctionId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        const getTotalFundQuery = `SELECT Total_Fund From Team_in_auction where team_id = :teamId and auction_id = :auctionId`;

        const bindVars = {
            teamId: { val: teamId },
            auctionId: { val: auctionId }
        };

        const totalFundResult = await connection.execute(getTotalFundQuery, bindVars);

        connection.close();

        res.json(totalFundResult.rows[0].TOTAL_FUND);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

//insert this
app.post("/setTotalFundForAuction", async (req, res) => {
    const { teamId, auctionId, totalFund } = req.body;

    try {
        // Check if the team is associated with the specified auction
        const isTeamAssociated = await checkTeamAssociationWithAuction(teamId, auctionId);

        if (!isTeamAssociated) {
            return res.status(400).json({ error: 'Team is not associated with this auction' });
        }

        // Update the total fund for the team in the Team_In_Auction table
        await updateTotalFundForTeamInAuction(teamId, auctionId, totalFund);

        res.json({ message: 'Total fund for the auction set successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


async function checkTeamAssociationWithAuction(teamId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const associationQuery = `
            SELECT 1
            FROM Team_In_Auction
            WHERE Team_Id = :teamId AND Auction_Id = :auctionId
        `;

        const bindVars = {
            teamId: { val: teamId, dir: oracledb.BIND_IN },
            auctionId: { val: auctionId, dir: oracledb.BIND_IN }
        };

        const result = await connection.execute(associationQuery, bindVars);
        connection.close();

        return result.rows.length > 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


//change hye giyeche
async function updateTotalFundForTeamInAuction(teamId, auctionId, totalFund) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const updateQuery = `
            UPDATE Team_In_Auction
            SET Total_Fund = :totalFund , Available_Fund = :totalFund
            WHERE Team_Id = :teamId AND Auction_Id = :auctionId
        `;

        const bindVars = {
            totalFund: { val: totalFund, dir: oracledb.BIND_IN },
            teamId: { val: teamId, dir: oracledb.BIND_IN },
            auctionId: { val: auctionId, dir: oracledb.BIND_IN }
        };

        await connection.execute(updateQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}


app.listen(9002, async () => {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        ////console.log('DB connected');
        connection.close();
    } catch (error) {
        ////console.log('Error while establishing connection');
        console.error(error);
    }

    ////console.log('Server started on port 9002');
});
