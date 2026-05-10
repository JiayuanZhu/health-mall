const express = require('express');
const { getDB } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get cart items
router.get('/', authMiddleware, (req, res) => {
  const db = getDB();
  const items = db.prepare(`
    SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image, p.spec, p.stock 
    FROM cart c JOIN products p ON c.product_id = p.id 
    WHERE c.user_id = ?
  `).all(req.user.id);
  res.json(items);
});

// Add to cart
router.post('/', authMiddleware, (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const db = getDB();
  
  const existing = db.prepare('SELECT * FROM cart WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
  if (existing) {
    db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
  } else {
    db.prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.user.id, product_id, quantity);
  }
  res.json({ message: '已加入购物车' });
});

// Update cart item quantity
router.put('/:id', authMiddleware, (req, res) => {
  const { quantity } = req.body;
  const db = getDB();
  db.prepare('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, req.params.id, req.user.id);
  res.json({ message: '更新成功' });
});

// Remove from cart
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: '已移除' });
});

// Clear cart
router.delete('/', authMiddleware, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
  res.json({ message: '购物车已清空' });
});

module.exports = router;
