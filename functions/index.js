const {google} = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const calendar = google.calendar("v3");
const functions = require("firebase-functions");
const cors = require("cors");

const googleCredentials = require("./credentials.json");

const ERROR_RESPONSE = {
  status: "500",
  message: "There was an error adding an event to your Google calendar",
};

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

exports.listCalendars = functions.https.onRequest((req, res) => {
  cors()(req, res, () => {
    const oAuth2Client = new OAuth2(
        googleCredentials.web.client_id,
        googleCredentials.web.client_secret,
        googleCredentials.web.redirect_uris[0]
    );

    oAuth2Client.setCredentials({
      refresh_token: googleCredentials.refresh_token,
    });

    getCalendars(oAuth2Client)
        .then((data) => {
          res.status(200).send(data);
          return;
        })
        .catch((err) => {
          res.status(500).send(ERROR_RESPONSE);
          return;
        });
  });
});

