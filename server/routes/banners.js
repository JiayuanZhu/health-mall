const express = require('express');
const { getDB } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDB();
  const banners = db.prepare('SELECT * FROM banners WHERE status = 1 ORDER BY sort_order').all();
  res.json(banners);
});

module.exports = router;
