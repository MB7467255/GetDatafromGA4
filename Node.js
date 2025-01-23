const express = require('express');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 3000;

// OAuth 2.0 Client Configuration
const oAuth2Client = new google.auth.OAuth2(
  '358405041059-e9c3kjh8crvhjp1acee66aquof3a0799', // Replace with your Client ID
  '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', // Replace with your Client Secret
  'https://get-datafrom-ga-4.vercel.app/' // Replace with your Redirect URI (e.g., http://localhost:3000/oauth2callback)
);

// GA4 Property ID
const propertyId = 'properties/474011638'; // Replace with your GA4 Property ID

// Store tokens (in memory for this example; replace with database in production)
let accessToken = null;
let refreshToken = null;

// Generate the Google OAuth 2.0 URL
app.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  res.redirect(authUrl);
});

// Handle OAuth 2.0 callback
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Store tokens
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;

    res.send('Authorization successful! You can now use the /get-demographics endpoint.');
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).send('Failed to authorize.');
  }
});

// Fetch demographics data
app.get('/get-demographics', async (req, res) => {
  try {
    // Ensure the access token is set
    if (!accessToken) {
      return res.status(401).send('Authorization is required. Please visit /auth first.');
    }

    // Set the credentials
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Refresh the access token if it's expired
    if (!oAuth2Client.isTokenExpiring()) {
      await oAuth2Client.refreshAccessToken();
    }

    // Initialize the Analytics Data API
    const analyticsData = google.analyticsdata('v1beta');

    // Run the report
    const response = await analyticsData.properties.runReport({
      property: propertyId,
      auth: oAuth2Client,
      requestBody: {
        dimensions: [{ name: 'gender' }, { name: 'ageBracket' }],
        metrics: [{ name: 'activeUsers' }],
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching demographics data:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch demographics data',
      details: error.response?.data || error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/auth to authorize the application.`);
});
