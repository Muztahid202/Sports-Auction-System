import React, { useState } from "react";
import "../css/register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Register = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        reEnterPassword: "",
        role: "" // Add role state
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

    const handleRegister = () => {
        console.log("User", user);
        // Perform registration logic here
        const { name, email, password, reEnterPassword, role } = user;
        if (name && email && password== reEnterPassword && role) {
            axios
                .post("http://localhost:9002/register", user)
                .then((res) => {
                    alert(res.data.message);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    return (
        <div className="register">
            <h1>Register</h1>
            <input
                type="text"
                name="name"
                value={user.name}
                placeholder="Your Name"
                onChange={handleChange}
            />
            <input
                type="text"
                name="email"
                value={user.email}
                placeholder="Your Email"
                onChange={handleChange}
            />
            <input
                type="password"
                name="password"
                value={user.password}
                placeholder="Your Password"
                onChange={handleChange}
            />
            <input
                type="password"
                name="reEnterPassword"
                value={user.reEnterPassword}
                placeholder="Re-enter Password"
                onChange={handleChange}
            />

            <select name="role" value={user.role} onChange={handleRoleChange}>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="team">Team</option>
                <option value="player">Player</option>
                <option value="bidmanager">Bid Manager</option>
            </select>
            //if in the above select tag, the value of user.role is "player", then render the following input field
            {
                user.role === "player" && (
                    <input
                        type="text"
                        name="playingRole"
                        value={user.playingRole}
                        placeholder="Playing Role"
                        onChange={handleChange}
                    />
                )
                
            }
            { user.role === "player" && (
                <input
                    type="text"
                    name="playingRole"
                    value={user.playingRole}
                    placeholder="Playing Role"
                    onChange={handleChange}
                />
            )}

            <div className="button" onClick={handleRegister}>
                Register
            </div>
            <div>or</div>
            {/* <div className="button">Login</div> */}
            <div className="button" onClick={() => navigate("/login")}> Login </div>
        </div>
    );
};

export default Register;

// to import react and usestate from react
// import React , { useState} from "react";
// import "../css/register.css";



// const Register = () => {
//     const [user, setUser] = useState({
//         name: "",
//         email:"",
//         password:"",
//         reEnterPassword: ""
//     }) 
//     const handleChange = e => {
//         const {name, value} = e.target
//         setUser({
//             ...user,
//             [name]: value
//         })
//     }

//     return (
//         <div className="register">
//             <h1>Register</h1>
//             {console.log("User", user)}
//             <input type="text" name="name" value = {user.name} placeholder="Your Name" onChange={handleChange}></input>
//             <input type="text" name="email" value = {user.email} placeholder="Your Email" onChange={handleChange}></input>
//             <input type="password" name="password" value = {user.password} placeholder="Your Password" onChange={handleChange}></input>
//             <input type="password" name="reEnterPassword" value = {user.reEnterPassword} placeholder="Re-enter Password" onChange={handleChange}></input>

            
//             <div className="button">Register</div>
//             <div>or</div>
//             <div className="button">Login</div>
//         </div>
//     );
// }

// export default Register;


// import React, { useState } from "react"
// import "./register.css"
// import axios from "axios"
// import { useHistory } from "react-router-dom"

// const Register = () => {

//     const history = useHistory()

//     const [ user, setUser] = useState({
//         name: "",
//         email:"",
//         password:"",
//         reEnterPassword: ""
//     })

//     const handleChange = e => {
//         const { name, value } = e.target
//         setUser({
//             ...user,
//             [name]: value
//         })
//     }

//     const register = () => {
//         const { name, email, password, reEnterPassword } = user
//         if( name && email && password && (password === reEnterPassword)){
//             axios.post("http://localhost:9002/register", user)
//             .then( res => {
//                 alert(res.data.message)
//                 history.push("/login")
//             })
//         } else {
//             alert("invlid input")
//         }
        
//     }

//     return (
//         <div className="register">
//             {console.log("User", user)}
//             <h1>Register</h1>
//             <input type="text" name="name" value={user.name} placeholder="Your Name" onChange={ handleChange }></input>
//             <input type="text" name="email" value={user.email} placeholder="Your Email" onChange={ handleChange }></input>
//             <input type="password" name="password" value={user.password} placeholder="Your Password" onChange={ handleChange }></input>
//             <input type="password" name="reEnterPassword" value={user.reEnterPassword} placeholder="Re-enter Password" onChange={ handleChange }></input>
//             <div className="button" onClick={register} >Register</div>
//             <div>or</div>
//             <div className="button" onClick={() => history.push("/login")}>Login</div>
//         </div>
//     )
// }

// export default Register