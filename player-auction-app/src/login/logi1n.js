import React, { useState } from "react";
import axios from "axios";
import "../css/login.css";
import { useNavigate } from "react-router-dom";
const Login = () => {
    // const history = useHistory();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        email: "",
        password: "",
        role: "" 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({
            ...user,
            [name]: value
        });
    };

    const handleRoleChange = (e) => {
        setUser({
            ...user,
            role: e.target.value
        });
    };

    const handleLogin = () => {
        console.log("User", user);
        // Perform login logic here
        const { email, password, role } = user;
        if (email && password && role) {
            axios
                .post("http://localhost:9002/login", user)
                .then((res) => {
                    // console.log(res.data.message);

                    // alert(res.data.message);
                    if(res.data.message === "Login successful") {
                        navigate("/");
                        console.log("Login successful");
                        alert("Login successful");
                    }
                    else {
                       console.log("Invalid Credentials");
                          alert("Invalid Credentials");
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        else {
            alert("Invalid input");
        }

    };

    return (
        <div className="login">
            {console.log("User", user)}
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
            {/* <div className="button" >Register</div> */}
            {/* <div className="button" onClick={() => history.push("/register")}>Register</div> */}
            <div className="button" onClick={() => navigate("/register")}>Register</div>
        </div>
    );
}

export default Login;
