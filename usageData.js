const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { google } = require('google-auth-library');

const getAccessToken = async () => {
    const credentials = require('./netflix-a97e4-03255c61236f.json'); // Load the service account credentials
    const client = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/cloud-platform'],
    );
    const accessToken = await client.getAccessToken();
    return accessToken.token;
};

const listProjects = async () => {
  try {
    const accessToken = await getAccessToken(); // Wait for the access token to be retrieved
    const uri = 'https://firebase.googleapis.com/v1beta1/availableProjects';
    const options = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
    };

    const rawResponse = await fetch(uri, options);
    const resp = await rawResponse.json();
    const projects = resp['projectInfo'];
    
    // Create an array to store the project data
    // const projectData = projects.map((project, i) => {
    //   return {
    //     projectIndex: i,
    //     projectId: project['project'],
    //     displayName: project['displayName'],
    //   };
    // });
    
    return rawResponse; // Return the project data instead of printing it
  } catch (err) {
    console.error(err);
    throw err; // Throw the error to be handled by the caller
  }
};


module.exports = listProjects;