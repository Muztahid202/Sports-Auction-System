import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const Homepage = ({ userInfo }) => {
  const [players, setPlayers] = useState([]);
  const userInfosRef = useRef(null); // Ref to store the latest userInfos value

  useEffect(() => {
    // Fetch the user information from the cookie
    const storedUserInfo = Cookies.get('userInfo');
    console.log('Fetching user info from cookie:', storedUserInfo);
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      userInfosRef.current = parsedUserInfo; // Update the ref with the latest value
      console.log('User info:', parsedUserInfo);
    }
  }, []); // This effect should run only once, on component mount

  useEffect(() => {
    // Fetch the list of players if the user is an admin
    console.log('Fetching players');
    console.log('User info from ref:', userInfosRef.current);

    if (userInfosRef.current && userInfosRef.current.Role === 'Admin') {
      axios.get('http://localhost:9002/players')
        .then((res) => {
          setPlayers(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []); // This effect depends on userInfosRef.current
// console.log("Iaaa");
  return (
    <div>
      {userInfosRef.current ? (
        <>
          <h1>Hello, {userInfosRef.current.NAME}</h1>
          
          {/* Render players list if the user is an admin */}
          {userInfosRef.current.Role === 'Admin' && players.length > 0 && (
            <div>
              <h2>Player List</h2>
              <table >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    {/* ... other player attributes */} 
                  </tr>

                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.ID}>
                      <td>{player.ID}</td>
                      <td>{player.NAME}</td>
                      {/* ... other player attributes */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default Homepage;
