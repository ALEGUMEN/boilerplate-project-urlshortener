require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// ======================================
// URL Shortener API
// ======================================

let urlDatabase = {}; // almacenamiento en memoria: { short_url: original_url }
let idCounter = 1;

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Verificar si la URL tiene un host válido
  const hostname = url.parse(originalUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      const shortUrl = idCounter++;
      urlDatabase[shortUrl] = originalUrl;
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// ======================================
// Listen on port
// ======================================
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
