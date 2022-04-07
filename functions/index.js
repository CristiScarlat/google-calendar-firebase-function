const {google} = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const calendar = google.calendar("v3");
const functions = require("firebase-functions");
const cors = require("cors");

const credentials = require("./credentials.json");

function getCalendars(auth) {
  return new Promise(function(resolve, reject) {
    calendar.calendarList.list({
      auth: auth,
    }, (error, res) => {
      if (error) {
        reject(error);
      }
      resolve(res.data);
    });
  });
}

function getEvents(auth, calendarId, props) {
  return new Promise(function(resolve, reject) {
    calendar.events.list({
      auth,
      calendarId,
      ...props,
    }, (error, res) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      resolve(res.data);
    });
  });
}

exports.listCalendars = functions.https.onRequest((req, res) => {
  cors()(req, res, () => {
    if (req.query.appKey && req.query.appKey === credentials.app_key) {
      const oAuth2Client = new OAuth2(
          credentials.web.client_id,
          credentials.web.client_secret,
          credentials.web.redirect_uris[0],
      );

      oAuth2Client.setCredentials({
        refresh_token: credentials.refresh_token,
      });

      if (req.query.q === "listCalendars") {
        getCalendars(oAuth2Client)
            .then((data) => {
              res.status(200).send(data);
              return;
            })
            .catch((err) => {
              res.status(500).send({
                status: "500",
                message: "There was an error retrieving data from Google calendar",
              });
              return;
            });
      } else if (req.query.q === "listEvents") {
        const props = {
          timeMin: req.query.timeMin,
          timeMax: req.query.timeMax,
        };
        getEvents(oAuth2Client, req.query.calendarId, props)
            .then((data) => {
              res.status(200).send(data);
              return;
            })
            .catch((err) => {
              res.status(500).send({
                status: "500",
                message: "There was an error retrieving data from Google calendar",
              });
              return;
            });
      } else if(req.query.q === "addEvent"){
        
      }
      else {
        res.status(500).send({
          status: "500",
          message: "Missing q parameter.",
        });
      }
    } else {
      res.status(401).send({
        status: "401",
        message: "Invalid authentication credentials for the target resource",
      });
    }
  });
});

