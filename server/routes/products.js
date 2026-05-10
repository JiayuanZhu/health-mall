const express = require('express');
const { getDB } = require('../db');

const router = express.Router();

// Get all products with optional filters
router.get('/', (req, res) => {
  const { category_id, keyword, is_hot, is_new, page = 1, limit = 20 } = req.query;
  const db = getDB();
  let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = 1';
  const params = [];

  if (category_id) {
    query += ' AND p.category_id = ?';
    params.push(category_id);
  }
  if (keyword) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (is_hot) {
    query += ' AND p.is_hot = 1';
  }
  if (is_new) {
    query += ' AND p.is_new = 1';
  }

  const offset = (page - 1) * limit;
  const countQuery = query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*) as total');
  const total = db.prepare(countQuery).get(...params).total;

  query += ' ORDER BY p.sales DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const products = db.prepare(query).all(...params);
  res.json({ products, total, page: Number(page), limit: Number(limit) });
});

// Get single product
router.get('/:id', (req, res) => {
  const db = getDB();
  const product = db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: '药品不存在' });
  }
  res.json(product);
});

// Get all categories
router.get('/meta/categories', (req, res) => {
  const db = getDB();
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  res.json(categories);
});

module.exports = router;
