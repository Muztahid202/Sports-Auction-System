import React, { useState } from "react";
import "../css/register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
const Register = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        reEnterPassword: "",
        role: "", // Add role state
        playingRole: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({
            ...user,
            [name]: value,
            // playingRole: value
        });
        console.log(user);
    };

    const handleRoleChange = (e) => {
        const selectedRole= e.target.value;
        setUser({
            ...user,
            role: selectedRole
        });
        if (selectedRole === "player") {
            setUser({
                ...user,
                playingRole: "",
                role: selectedRole
                });
        }
    };

    const handleRegister = () => {
        

        console.log("User", user);
        // Perform registration logic here
        const { name, email, password, reEnterPassword, role, playingRole } = user;
        // if(role === "player" && playingRole !== "") {
        if (name && email && password== reEnterPassword && role ) {
            axios
                .post("http://localhost:9002/register", user)
                .then((res) => {
                    // alert(res.data.message);
                    //alert("Registration successful"); or alert the error
                        console.log()
                    if (res.data.message === "Registration successful") {
                        console.log("HELLO");
                        //if data.user
                        // console.log(res.data.user);
                        // Cookies.set("userInfo", JSON.stringify(res.data.user), {
                        //     expires: 3
                        // });
                        if(role === "player") {
                            Cookies.set("playerInfo", JSON.stringify(res.data.user), {
                                expires: 3
                            });
                        }
                        else if(role === "team") {
                            Cookies.set("teamInfo", JSON.stringify(res.data.user), {
                                expires: 3
                            });
                        }
                        else if(role === "bidmanager") {
                            Cookies.set("bidmanagerInfo", JSON.stringify(res.data.user), {
                                expires: 3
                            });
                        }
                        else if(role === "admin") {
                            Cookies.set("adminInfo", JSON.stringify(res.data.user), {
                                expires: 3
                            });
                        }
                        

                        setUser(res.data.user);

                        alert("Registration successful");
                        const id = res.data.user.ID;
                        if (role === "admin") {
                            navigate("/homepage");
                        }
                        else if (role === "team") {
                            navigate(`/team/${id}`);
                        }
                        else if (role === "player") {
                            navigate(`/player/${id}`);
                        }
                        else if (role === "bidmanager") {
                            navigate(`/bidmanager/${id}`);
                        }
                        
                    }
                    else {
                        alert("Registration failed");
                    }

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
            {user.role === "player" &&(
                <input
                    type="text"
                    name="playingRole"
                    value={user.playingRole}
                    placeholder="Your Playing Role"
                    onChange={handleChange}
                />
            )}
            <div className="button" onClick={handleRegister}>
                Register
            </div>
            <div>or</div>
            {/* <div className="button" onClick ={Navigate}>Login</div> */}
            
            <div className="button" onClick={() => navigate('/login')}> Login</div>
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