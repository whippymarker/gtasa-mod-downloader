const express = require('express');
const multer = require('multer');
const session = require('express-session');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'mods/' });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'gta-mod-secret',
  resave: false,
  saveUninitialized: true
}));

// Serve public files (excluding upload.html)
app.use(express.static('public', {
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('upload.html')) {
      res.status(403).end('Access denied');
    }
  }
}));

// Serve mod files
app.use('/mods', express.static('mods'));

// Serve mod list
app.get('/mods', (req, res) => {
  fs.readFile('mods.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading mods');
    res.json(JSON.parse(data));
  });
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'gtasa') {
    req.session.loggedIn = true;
    res.redirect('/upload');
  } else {
    res.send('<p>Invalid credentials. <a href="/login">Try again</a></p>');
  }
});

// Protected upload page
app.get('/upload', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'private/upload.html'));
  } else {
    res.redirect('/login');
  }
});

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jhonatanmotta4123@gmail.com',       // Replace with your email
    pass: 'xict jtyo xicw fsbs'           // Use an app password if using Gmail
  }
});

// Protected upload route
app.post('/upload', (req, res, next) => {
  if (!req.session.loggedIn) {
    return res.status(403).send('<p>Access denied. <a href="/login">Login</a></p>');
  }
  next();
}, upload.single('modFile'), (req, res) => {
  const { name, description, id, thumbnail } = req.body;
  const modPath = `/mods/${req.file.filename}.zip`;

  fs.rename(req.file.path, `mods/${req.file.filename}.zip`, () => {
    fs.readFile('mods.json', 'utf8', (err, data) => {
      const mods = err ? [] : JSON.parse(data);
      mods.push({ id, name, description, thumbnail, download: modPath });
      fs.writeFile('mods.json', JSON.stringify(mods, null, 2), () => {
        // Send email notification
        const mailOptions = {
          from: 'your.email@gmail.com',
          to: 'your.email@gmail.com',
          subject: `New Mod Uploaded: ${name}`,
          html: `
            <h2>${name}</h2>
            <p>${description}</p>
            <p><a href="http://localhost:3000${modPath}">Download Mod</a></p>
          `
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Email failed:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });

        res.redirect('/mods.html');
      });
    });
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
