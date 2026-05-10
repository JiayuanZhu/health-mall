const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
  const { username, password, name, phone } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: '请填写完整注册信息' });
  }
  const db = getDB();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, password, name, phone) VALUES (?, ?, ?, ?)').run(
    username, hashedPassword, name, phone || ''
  );
  const token = jwt.sign({ id: result.lastInsertRowid, username, name, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: result.lastInsertRowid, username, name, phone, role: 'user' } });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(400).json({ error: '用户名或密码错误' });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: '用户名或密码错误' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, name: user.name, phone: user.phone, role: user.role } });
});

// Get current user profile
router.get('/profile', authMiddleware, (req, res) => {
  const db = getDB();
  const user = db.prepare('SELECT id, username, name, phone, email, role, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json(user);
});

// Update profile
router.put('/profile', authMiddleware, (req, res) => {
  const { name, phone, email } = req.body;
  const db = getDB();
  db.prepare('UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?').run(name, phone || '', email || '', req.user.id);
  res.json({ message: '更新成功' });
});

module.exports = router;
