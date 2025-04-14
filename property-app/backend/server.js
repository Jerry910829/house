const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "your_jwt_secret"; // 建议使用环境变量管理

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'property_app',
});

// 用户注册接口
app.post('/api/register', (req, res) => {
  const { username, password, contacts, photos } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).send('Error hashing password');
    const query = `INSERT INTO users (username, password, role) VALUES (?, ?, 'user')`;
    db.query(query, [username, hashedPassword], (err, results) => {
      if (err) return res.status(500).send('Error saving user');
      const userId = results.insertId;

      if (contacts?.length) {
        contacts.forEach(contact => {
          const name = `${contact.givenName || ''} ${contact.familyName || ''}`.trim();
          const phone = contact.phoneNumbers?.[0]?.number || '';
          db.query(`INSERT INTO contacts (user_id, name, phone) VALUES (?, ?, ?)`, [userId, name, phone]);
        });
      }

      if (photos?.length) {
        photos.forEach(photo => {
          db.query(`INSERT INTO photos (user_id, name, url) VALUES (?, ?, ?)`, [userId, photo.fileName, photo.uri]);
        });
      }

      res.status(200).send({ message: 'User registered successfully' });
    });
  });
});

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query(`SELECT * FROM users WHERE username = ?`, [username], (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Invalid username');
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) return res.status(401).send('Invalid password');
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '2h' });
      res.json({ token });
    });
  });
});

// 获取通讯录（示例分页 + 权限）
app.get('/api/contacts', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  db.query(`SELECT name, phone FROM contacts LIMIT ? OFFSET ?`, [parseInt(limit), offset], (err, results) => {
    if (err) return res.status(500).send('Error fetching contacts');
    res.json(results);
  });
});

// 获取照片
app.get('/api/photos', (req, res) => {
  db.query(`SELECT name, url FROM photos`, (err, results) => {
    if (err) return res.status(500).send('Error fetching photos');
    res.json(results);
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Cloudinary 配置（建议使用环境变量管理）
cloudinary.config({
  cloud_name: 'demo', // 替换为你的 cloud name
  api_key: '123456789012345', // 替换为你的 api_key
  api_secret: 'your_api_secret_here', // 替换为你的 api_secret
});

// 测试上传几张图片到 Cloudinary
app.post('/api/upload-demo-photos', (req, res) => {
  const demoImages = [
    'https://picsum.photos/seed/pic1/300/300',
    'https://picsum.photos/seed/pic2/300/300',
    'https://picsum.photos/seed/pic3/300/300',
  ];

  const userId = 1; // 测试用，正式使用应从 JWT token 中获取
  const uploadPromises = demoImages.map(async (imgUrl, index) => {
    try {
      const response = await cloudinary.uploader.upload(imgUrl, {
        folder: 'property-app',
        public_id: `demo_${Date.now()}_${index}`,
      });
      const photoQuery = `INSERT INTO photos (user_id, name, url) VALUES (?, ?, ?)`;
      db.query(photoQuery, [userId, response.original_filename, response.secure_url]);
      return response.secure_url;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  });

  Promise.all(uploadPromises)
    .then(urls => res.json({ message: 'Uploaded demo photos', urls }))
    .catch(err => res.status(500).send('Error uploading photos'));
});



// 新增权限中间件
function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).send('Unauthorized');
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).send('Forbidden');
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).send('Invalid token');
    }
  };
}



// 管理员专属接口：获取通讯录（分页）
app.get('/api/contacts', authMiddleware('admin'), (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  db.query(`SELECT name, phone FROM contacts LIMIT ? OFFSET ?`, [parseInt(limit), offset], (err, results) => {
    if (err) return res.status(500).send('Error fetching contacts');
    res.json(results);
  });
});
