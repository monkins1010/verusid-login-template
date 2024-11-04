const express = require('express')
const app = express()
const JWT = require("jsonwebtoken");
const { VerusIdInterface, primitives } = require('verusid-ts-client');
const { registeredChallengeIDs } = require('./websocket')
const { randomBytes } = require('crypto');
const { clients } = require('./websocket');

const { PRIVATE_KEY, SIGNING_IADDRESS, CHAIN, API, CHAIN_IADDRESS, JWT_SECRET, SERVER_URL } = process.env;
const VerusId = new VerusIdInterface(CHAIN, API);

const R_ADDRESS_VERSION = 60;
const I_ADDRESS_VERSION = 102;

function generateChallengeID(len = 20) {
  const buf = randomBytes(len)
  const randBuf = Buffer.from(buf)
  const iaddress = primitives.toBase58Check(randBuf, I_ADDRESS_VERSION)
  return iaddress
}

module.exports = app.post("/login", async (req, res) => {

  let reply = {
    error: null,
    data: null,
    success: true
  }

  try {
    const challenge_id = generateChallengeID();

    registeredChallengeIDs.add(challenge_id);

    VerusId.createLoginConsentRequest(
      SIGNING_IADDRESS,
      new primitives.LoginConsentChallenge({
        challenge_id: challenge_id,
        requested_access: [
          new primitives.RequestedPermission(primitives.IDENTITY_VIEW.vdxfid)
        ],
        redirect_uris: [
          new primitives.RedirectUri(
            `${SERVER_URL}/verusidlogin`,
            primitives.LOGIN_CONSENT_WEBHOOK_VDXF_KEY.vdxfid
          ),
        ],
        subject: [],
        provisioning_info: [],
        created_at: Number((Date.now() / 1000).toFixed(0)),
      }),
      PRIVATE_KEY,
      null,
      null,
      CHAIN_IADDRESS
    ).then(async retval => {

      const _reso = await VerusId.verifyLoginConsentRequest(
        primitives.LoginConsentRequest.fromWalletDeeplinkUri(retval.toWalletDeeplinkUri()),
        null,
        CHAIN_IADDRESS
      )
      console.log("Login Request Signed Correctly: ", _reso, challenge_id);

      reply.data = {deepLink: retval.toWalletDeeplinkUri(), challengeID: challenge_id};
      reply.success = true;
      res.status(200).send(reply);
    });

  } catch (e) {
    reply.error = e?.message ? e.message : e.error ? e.error.toString() : e;
    reply.success = false;
    res.send(reply);
    console.log("Whoops something went wrong: ", reply);
  }

});


module.exports = app.post("/verusidlogin", async (req, res) => {

  const data = req.body;

  try {
    const loginRequest = new primitives.LoginConsentResponse(data)

    const verifiedLogin = await VerusId.verifyLoginConsentResponse(loginRequest)
    console.log("Is login signature Verified? : ", verifiedLogin);
    
    const challengeID = loginRequest.decision.request.challenge.challenge_id;

    if (!verifiedLogin || registeredChallengeIDs.has(challengeID) === false) {
      res.status(400).send(false);
      return;
    }

    // Check user is allowed to login here if only certain iaddress are allowed to login...

    const {result} = await VerusId.interface.getIdentity(loginRequest.signing_id)

    for (const [client] of clients) {
      if (client.readyState === 1 && client.params === challengeID) {
        const accessToken = await JWT.sign(
          { idLoggedIn: loginRequest.signing_id },
          JWT_SECRET,
          {
            expiresIn: "4h",
          }
        );

        client.send(JSON.stringify({ JWT: accessToken, iaddress: loginRequest.signing_id, name: result.friendlyname }));
        registeredChallengeIDs.delete(challengeID);
        break; // Exit the loop after sending the message
      }
    }
    console.log("Newlogin: ", loginRequest.signing_id)
    res.send(true);
  } catch (e) {
    console.log("Whoops something went wrong: ", e);
    res.status(400).send(e?.message ? e.message : e.error ? e.error.toString() : e);
  }
});