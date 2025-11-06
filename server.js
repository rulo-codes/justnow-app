const http = require('http');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const bcrypt = require('bcrypt');
const db = require('./db');

const publicPath = path.join(__dirname, 'public');

// simple session simulation
let loggedInUser = null;

const server = http.createServer((req, res) => {
  // Serve static files
  if (req.method === 'GET') {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(publicPath, filePath);

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    if (extname === '.css') contentType = 'text/css';
    else if (extname === '.js') contentType = 'application/javascript';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.statusCode = 404;
        res.end('404 Not Found');
        return;
      }
      res.setHeader('Content-Type', contentType);
      res.end(content);
    });
  }

  // Handle POST requests (Register, Login, Logout)
  else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const data = qs.parse(body);
      const formType = data.formType;

      // REGISTER
      if (formType === 'register') {
        try {
          const hashedPassword = await bcrypt.hash(data.password, 10);
          const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
          db.query(sql, [data.username, data.email, hashedPassword], (err) => {
            res.setHeader('Content-Type', 'application/json');
            if (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Email or username already in use.' }));
              return;
            }
            res.end(JSON.stringify({ success: true, message: 'Registration successful!' }));
          });
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Server error during registration.' }));
        }
      }

      // LOGIN
      else if (formType === 'login') {
        console.log('Login data:', data);

        const sql = "SELECT * FROM users WHERE email = ?";
        console.log('SQL Query:', sql, [data.email]);

        db.query(sql, [data.email], async (err, results) => {
          if (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Server error during login.' }));
            return;
          }

          if (results.length === 0) {
            res.statusCode = 401;
            res.end(JSON.stringify({ error: 'User not found.' }));
            return;
          }

          console.log('Results from DB:', results);
          
          const user = results[0];
          console.log('Raw entered password:', data.password);
          console.log('Stored hashed password:', user.password);

            try {
            const match = await bcrypt.compare(data.password, user.password);
            console.log('Password match result:', match);

            if (match) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true,  username: user.username, message: 'Login successful!' }));
            } else {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid password.' }));
            }

            } catch (err) {
            console.error('Bcrypt error:', err);
            res.statusCode = 500;
            res.end('Server error during password comparison');
            }
        });
      }

      // LOGOUT
      else if (req.url === '/logout') {
        loggedInUser = null;
        res.statusCode = 200;
        res.end('Logged out');
      }

      else {
        res.statusCode = 400;
        res.end('Unknown form type.');
      }
    });
  }

  else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
