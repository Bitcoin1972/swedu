const express = require('express');
const path = require('path');
const fs = require('fs');
const { installContact } = require('./lib/contact');
const { installProgrammePages } = require('./lib/programme-pages');
const { installPartnerCampus } = require('./lib/partner-campus');

const app = express();
const PORT = process.env.PORT || 3000;
installProgrammePages(app);
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
installPartnerCampus(app);

// Video streaming route with proper headers for autoplay
app.get('/intro.mp4', (req, res) => {
  const videoPath = path.join(__dirname, 'public', 'intro.mp4');
  
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video not found');
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.use(express.static(path.join(__dirname, 'public')));
installContact(app);

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.listen(PORT, () => {
  console.log(`Smart World Education running on port ${PORT}`);
});
