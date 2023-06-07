const router = require("express").Router();
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { JWT } = require('google-auth-library');

const credentials = require('../netflix-a97e4-03255c61236f.json');
const SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];

admin.initializeApp({
  credential: admin.credential.cert(credentials),
  storageBucket: 'netflix-a97e4.appspot.com'
});

const bucket = admin.storage().bucket();
async function getStorageUsage() {
  const [files] = await bucket.getFiles();
  let totalSize = 0;
  files.forEach(file => {
      totalSize += file.metadata.size;
  });
  return totalSize;
}

function getAccessToken() {
  return new Promise(function(resolve, reject) {
    const jwtClient = new JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function(err, tokens) {
        if (err) {
            reject(err);
            return;
        }
        resolve(tokens.access_token);
    });
  });
}


router.get('/', async (req, res) => {
    try {
      const accessToken = await getAccessToken();
      const uri = 'https://firebase.googleapis.com/v1beta1/availableProjects';
      const options = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
      };
      const rawResponse = await fetch(uri, options);
      const totalSize = await getStorageUsage();

      res.status(200).json(totalSize);
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to list projects');
    }
});

module.exports = router;
// module.exports = listProjects;