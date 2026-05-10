const express = require('express');
const { getDB } = require('../db');

const router = express.Router();

// Get all departments
router.get('/', (req, res) => {
  const { is_hot } = req.query;
  const db = getDB();
  let query = 'SELECT * FROM departments';
  if (is_hot) {
    query += ' WHERE is_hot = 1';
  }
  query += ' ORDER BY sort_order';
  const departments = db.prepare(query).all();
  res.json(departments);
});

// Get single department with doctors
router.get('/:id', (req, res) => {
  const db = getDB();
  const department = db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id);
  if (!department) {
    return res.status(404).json({ error: '科室不存在' });
  }
  const doctors = db.prepare('SELECT * FROM doctors WHERE department_id = ?').all(req.params.id);
  res.json({ ...department, doctors });
});

module.exports = router;
