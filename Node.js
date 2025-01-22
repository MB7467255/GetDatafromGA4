const express = require('express');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 3000;

// OAuth 2.0 Client Configuration
const oAuth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'YOUR_REDIRECT_URI'
);

// GA4 Property ID
const propertyId = 'properties/YOUR_PROPERTY_ID';

app.get('/get-demographics', async (req, res) => {
  try {
    // Ensure tokens are set before calling the API
    oAuth2Client.setCredentials({
      access_token: 'YOUR_ACCESS_TOKEN',
      refresh_token: 'YOUR_REFRESH_TOKEN',
    });

    const analyticsData = google.analyticsdata('v1beta');
    const response = await analyticsData.properties.runReport({
      property: propertyId,
      requestBody: {
        dimensions: [
          { name: 'gender' },
          { name: 'ageBracket' },
        ],
        metrics: [
          { name: 'activeUsers' },
        ],
        dateRanges: [
          {
            startDate: '7daysAgo',
            endDate: 'today',
          },
        ],
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching demographics data:', error);
    res.status(500).json({ error: 'Failed to fetch demographics data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
