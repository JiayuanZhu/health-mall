const express = require('express');
const { getDB } = require('../db');

const router = express.Router();

// Get all doctors with optional filters
router.get('/', (req, res) => {
  const { department_id } = req.query;
  const db = getDB();
  let query = 'SELECT d.*, dept.name as department_name FROM doctors d LEFT JOIN departments dept ON d.department_id = dept.id';
  const params = [];
  if (department_id) {
    query += ' WHERE d.department_id = ?';
    params.push(department_id);
  }
  query += ' ORDER BY d.rating DESC';
  const doctors = db.prepare(query).all(...params);
  res.json(doctors);
});

// Get single doctor
router.get('/:id', (req, res) => {
  const db = getDB();
  const doctor = db.prepare('SELECT d.*, dept.name as department_name FROM doctors d LEFT JOIN departments dept ON d.department_id = dept.id WHERE d.id = ?').get(req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: '医生不存在' });
  }
  res.json(doctor);
});

module.exports = router;
