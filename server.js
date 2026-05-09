const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
  const { name, email, organization, message, type } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Log contact (in production, send email via nodemailer)
  console.log('Contact form submission:', { name, email, organization, message, type });

  const mailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const mailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const mailTo = process.env.EMAIL_TO || mailUser;

  // If SMTP credentials are set, send email
  if (mailUser && mailPass) {
    try {
      const transporter = process.env.SMTP_HOST
        ? nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 465),
            secure: process.env.SMTP_SECURE !== 'false',
            auth: {
              user: mailUser,
              pass: mailPass
            }
          })
        : nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: mailUser,
              pass: mailPass
            }
          });

      await transporter.sendMail({
        from: `"Smart World Education" <${mailUser}>`,
        replyTo: email,
        to: mailTo,
        subject: `[swedu.me] ${type || 'Contact'} from ${name}`,
        html: `
          <h2>New Contact from swedu.me</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
          <p><strong>Type:</strong> ${type || 'General'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      });
    } catch (err) {
      console.error('Email error:', err);
    }
  }

  res.json({ success: true, message: 'Thank you. We will be in touch shortly.' });
});

app.listen(PORT, () => {
  console.log(`Smart World Education running on port ${PORT}`);
});
