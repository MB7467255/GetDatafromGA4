const express = require('express');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 3000;

// OAuth 2.0 Client Configuration
const oAuth2Client = new google.auth.OAuth2(
  '358405041059-e9c3kjh8crvhjp1acee66aquof3a0799', // Replace with your Client ID
  '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',           // Replace with your Client Secret
  'https://get-datafrom-ga-4.vercel.app/'          // Replace with your Redirect URI
);

// GA4 Property ID
const propertyId = 'properties/474011638'; // Replace with your GA4 Property ID

// Route to fetch demographics data
app.get('/get-demographics', async (req, res) => {
  try {
    // Set OAuth2 credentials (replace with valid tokens)
    oAuth2Client.setCredentials({
      access_token: 'YOUR_ACCESS_TOKEN',     // Replace with a valid access token
      refresh_token: 'YOUR_REFRESH_TOKEN',   // Replace with a valid refresh token
    });

    // Initialize Analytics Data API
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

    // Send response data
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
});
