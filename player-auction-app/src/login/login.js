import React, { useState } from 'react';
import axios from 'axios';
import '../css/login.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Login = ({ setUserInfo }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: '',
    password: '',
    role: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleRoleChange = (e) => {
    setUser({
      ...user,
      role: e.target.value,
    });
  };

  const handleLogin = () => {
    const { email, password, role } = user;
    if (email && password && role) {
      axios
        .post('http://localhost:9002/login', user)
        .then((res) => {
          if (res.data.message === 'Login successful') {
            // Cookies.set('userInfo',JSON.stringify(res.data.user), { expires: 3 });
            // setUserInfo(res.data.user);
            if (role === "player") {
              Cookies.set("playerInfo", JSON.stringify(res.data.user), {
                expires: 3
              });
            }
            else if (role === "team") {
              Cookies.set("teamInfo", JSON.stringify(res.data.user), {
                expires: 3
              });
            }
            else if (role === "bidmanager") {
              Cookies.set("bidmanagerInfo", JSON.stringify(res.data.user), {
                expires: 3
              });
            }
            else if (role === "admin") {
              Cookies.set("adminInfo", JSON.stringify(res.data.user), {
                expires: 3
              });
            }
            console.log(res.data.user);
            alert('Login successful');
            const id = res.data.user.ID;
            if (role === 'admin') {
              navigate('/homepage');
            }
            else if (role === 'team') {
              navigate(`/team/${id}`);
            }
            else if (role === 'player') {
              navigate(`/player/${id}`);
            }
            else if (role === 'bidmanager') {
              navigate(`/bidmanager/${id}`);
            }

          } else {
            alert('Invalid Credentials');
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      alert('Invalid input');
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <input
        type="text"
        name="email"
        value={user.email}
        placeholder="Enter your Email"
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        value={user.password}
        placeholder="Enter your Password"
        onChange={handleChange}
        required
      />

      <select name="role" value={user.role} onChange={handleRoleChange}>
        <option value="">Select Role</option>
        <option value="admin">Admin</option>
        <option value="team">Team</option>
        <option value="player">Player</option>
        <option value="bidmanager">Bid Manager</option>
      </select>

      <div className="button" onClick={handleLogin}>
        Login
      </div>
      <div>or</div>
      <div className="button" onClick={() => navigate('/register')}>
        Register
      </div>
    </div>
  );
};

export default Login;
