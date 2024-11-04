import React, { useState } from "react";
import Loading from "./loading";
import {Typography} from '@mui/material';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");
    const iaddress = localStorage.getItem("iaddress");
    const name = localStorage.getItem("name");

    return (
        <div >
        {loading ? 
        <div >
        <Loading />
        </div> : 
         <div>
         <h3>Logged In</h3>
            <Typography><b>Welcome:</b> {name}</Typography>
         </div>}
     </div>
    );
};

export default Login;