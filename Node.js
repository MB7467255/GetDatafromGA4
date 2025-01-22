const { google } = require('googleapis');
const express = require('express');
const app = express();
const port = 3000;

// OAuth 2.0 Client
const oAuth2Client = new google.auth.OAuth2(
  '275358461010-gd0ikq8ksa17vsf5flrbftcan6bmga3d',
  'YOGOCSPX-R7bnJO61woBTiGRW3a07R_wmobQc',
  'https://mb7467255.github.io/GetDatafromGA4/'
);

// สร้าง URL สำหรับการยืนยันตัวตน
const authorizeUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/analytics.readonly'],
});

// ใช้ URL สำหรับรับรหัส token จากผู้ใช้
app.get('/auth', (req, res) => {
  res.redirect(authorizeUrl);
});

// ใช้ Token เพื่อดึงข้อมูล
app.get('/callback', async (req, res) => {
  const { tokens } = await oAuth2Client.getToken(req.query.code);
  oAuth2Client.setCredentials(tokens);

  // ใช้ Google Analytics Data API เพื่อดึงข้อมูล Demographics
  const analyticsData = google.analyticsdata('v1beta');
  
  const response = await analyticsData.properties.runReport({
    property: 'properties/YOUR_GA4_PROPERTY_ID',
    requestBody: {
      dimensions: [
        { name: 'gender' },
        { name: 'ageBracket' }
      ],
      metrics: [
        { name: 'activeUsers' }
      ],
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today'
        }
      ]
    }
  });

  res.json(response.data);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
