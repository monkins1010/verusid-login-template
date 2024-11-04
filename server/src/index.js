require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const login = require("./routes/login")
const wss = require('./routes/websocket');

//express setup
const app = express();
const expressWs = require('express-ws');
expressWs(app);
const port = 8000;

app.use(bodyParser.json({
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf;
    }
}));
app.use(bodyParser.urlencoded({
    extended: false,
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf;
    }
}));

app.use(cors({
    origin: '*'
}));
app.use(cookieParser());

app.use('/', wss.app);

app.use('/', login);

app.listen(port, () => {
    console.log(`running server on port ${port}`);
});