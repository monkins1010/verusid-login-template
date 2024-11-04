import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { toast } from 'react-toastify';
import { login } from "../api/login";
import Loading from "./loading";
import {Typography} from '@mui/material';
const { VITE_WS_SERVER } = import.meta.env;

const Login = () => {
    const [showLoginQR, setShowLoginQR] = useState(false);
    const [QRData, setQRData] = useState("");
    const [loading, setLoading] = useState(false);
    const [challengeID, setChallengeID] = useState(false);

    const handleClick = async () => {
        try {
            setLoading(true);
            const reply = await login();

            if (reply?.success) {
                console.log(reply);
                setShowLoginQR(true);
                setQRData(reply.data.deepLink);
                setChallengeID(reply.data.challengeID);
                setLoading(false);
                console.log(reply.data.deepLink);
            } else {
                toast(reply?.error, { type: "warning" });
                setLoading(false);
            }
        } catch (e) {
            console.log(e);
            toast("Failed to get QR, please try again", { type: "warning" });
            setLoading(false);
        }
    };

    useEffect(() => {

        if (challengeID) {
          const socket = new WebSocket(VITE_WS_SERVER + "/awaitlogin/" + challengeID);
    
          socket.onopen = () => {
            console.log("WebSocket connection established");
          };
    
          socket.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data);
            console.log("Received message: ", receivedMessage);
            localStorage.setItem("token", JSON.stringify(receivedMessage.JWT));
            localStorage.setItem("iaddress", receivedMessage.iaddress);
            localStorage.setItem("name", receivedMessage.name);
            window.location.assign("/loggedin");
          };
    
          return () => {
            socket.close();
          };
        }
      }, [challengeID]);


    return (
        <div >
        {loading ? 
        <div >
        <Loading />
        </div> : 
         <div>
         <h3>Sign In</h3>
         <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', alignContent: "center"  }}>
             {QRData && <><QRCode value={QRData}  /> <Typography >
             Please scan the QR code with your Verus Mobile app.
         </Typography></>}
         </div>
         <div className="d-flex justify-content-between">
             {(!showLoginQR) && <button type="button" className="btn btn-primary btn-block" onClick={() => handleClick()}>Login with your ID</button>}
         </div>
         <p className="forgot-password text-right">
             Get <a href="#">Verus Wallet</a>
         </p> 
             </div>}
     </div>
    );
};

export default Login;