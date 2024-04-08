import express from 'express';
import cors from 'cors';
import oracledb from 'oracledb';

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
    try{
        const result = await loginUser(email, password, role);
        res.j
        if(result){
            res.json({message: 'Login successful'});
        }else{
            res.json({message: 'User not found'});
        }
    }
    catch(error){
        console.error(error); 
        res.status(500).json({error: 'An error occurred'});

    }
});

app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const result = await registerUser(name, password, email, role);

        if (result) {
            res.json({ message: 'Registration successful'});
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// add loginuser code here
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
        const loginQuery = `SELECT COUNT(*) AS user_count FROM ${tableName} WHERE Mail = :email AND Password = :password`;
        const loginResult = await connection.execute(loginQuery, { email, password });
        const userCount = loginResult.rows[0].USER_COUNT;
        connection.close();
        if(userCount > 0) {
            // console.log('User found');
            return true;
            // res.send({message: 'Login successful', user: user})
        }
        else{
            // console.log('Invalid credentials');
            return false;
            // res.send({message: 'Invalid credentials'})
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

// ...

async function registerUser(name, password, email, role) {
    try {
        let tableName = '';
        let additionalData = {};

        console.log(role);

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
                additionalData.Taken_Player = 0; // Set your default value here
                additionalData.Total_Player = 0; // Set your default value here
                additionalData.Available_Fund = 0.0; // Set your default value here
                additionalData.Total_Fund = 0.0; // Set your default value here
                
                break;
            case 'player':
                tableName = 'Player';
                // Additional data for the Player table
                additionalData.Base_Price = 0.0; // Set your default value here
                additionalData.Category = ''; // Set your default value here
                additionalData.Photo = ''; // Set your default value here
                additionalData.Status = ''; // Set your default value here
                additionalData.Playing_Role = ''; // Set your default value here
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

        // Get the current number of records in the table
        const countQuery = `SELECT COUNT(*) AS record_count FROM ${tableName}`;
        const countResult = await connection.execute(countQuery);
        const recordCount = countResult.rows[0].RECORD_COUNT;

        // Generate the ID as a 3-digit padded string
        const generatedId = (recordCount + 1).toString().padStart(3, '0');

       
      
        console.log("IN");
        // Construct the INSERT query
        // Construct the INSERT query
        const insertQuery = `INSERT INTO ${tableName} (ID, Name, Password, ${Object.keys(additionalData).join(', ')})
        VALUES (:id, :name, :password, ${Object.keys(additionalData).map(key => `:${key}`).join(', ')})`;
        

        const bindVars = {
            id: generatedId,
            name: name,
            password: password,
            ...additionalData
        };

        // Execute the INSERT query
        console.log('User registered');
        await connection.execute(insertQuery, bindVars);
        //commit the transaction
        await connection.commit();

        connection.close();

        console.log(`User registered with ID: ${generatedId}`);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// ...

app.listen(9002, async () => {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        console.log('DB connected');
        connection.close();
    } catch (error) {
        console.log('Error while establishing connection');
        console.error(error);
    }

    console.log('Server started on port 9002');
});
