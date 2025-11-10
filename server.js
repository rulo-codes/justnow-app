const http = require('http');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const bcrypt = require('bcrypt');
const db = require('./db');

const publicPath = path.join(__dirname, 'public');
let loggedInUser = null;

const server = http.createServer((req, res) => {
  // GET /api/posts (fetch diaries)
  if (req.method === 'GET' && req.url === '/api/posts') {
    if(!loggedInUser || !loggedInUser.id){
      console.error("Error: Unauthorized");
      res.writeHead(401, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ error: "Unauthorized."}));
    }

    const userId = loggedInUser.id;
    const sql = 'SELECT * FROM diary_entries WHERE user_id = ? ORDER BY id DESC';

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching diaries: ', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify([]));
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    });
    return;
  }
  
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
    return;
  }

  // POST /api/post (create diary)
  if (req.method === 'POST' && req.url === '/api/post') {

    if(!loggedInUser || !loggedInUser.id){
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({success: false, error: "Unauthorized. Please log in."}));
      return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { diaryContent } = JSON.parse(body);
        const userId = loggedInUser.id;
        const sql = 'INSERT INTO diary_entries (user_id, content) VALUES (?, ?)';
        db.query(sql, [userId, diaryContent], (err, result) => {
          res.setHeader('Content-Type', 'application/json');
          if (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: "Database error during upload." }));
            return;
          }
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, id: result.insertId }));
        });
      } catch (error) {
        console.error('JSON parsing error: ', error);
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, error: "Invalid JSON." }));
      }
    });
    return;
  }

  // POST /logout
  if (req.method === 'POST' && req.url === '/logout') {
    loggedInUser = null;
    res.statusCode = 200;
    res.end('Logged out');
    return;
  }

  // POST / (login/register)
  if (req.method === 'POST' && req.url === '/') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const data = qs.parse(body);
      const formType = data.formType;

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

      else if (formType === 'login') {
        db.query('SELECT * FROM users WHERE email = ?', [data.email], async (err, results) => {
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

          const user = results[0];
          try {
            const match = await bcrypt.compare(data.password, user.password);
            if (match) {
              loggedInUser = user;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, username: user.username, message: 'Login successful!' }));
            } else {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid password.' }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.end('Server error during password comparison');
          }
        });
      }

      else {
        res.statusCode = 400;
        res.end('Unknown form type.');
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
