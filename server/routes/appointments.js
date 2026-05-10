const express = require('express');
const { getDB } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create appointment
router.post('/', authMiddleware, (req, res) => {
  const { doctor_id, department_id, appointment_date, time_slot, patient_name, patient_phone, symptoms } = req.body;
  
  if (!doctor_id || !department_id || !appointment_date || !time_slot || !patient_name || !patient_phone) {
    return res.status(400).json({ error: '请填写完整预约信息' });
  }

  const db = getDB();
  
  // Check if slot is already taken
  const existing = db.prepare('SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND status != ?')
    .get(doctor_id, appointment_date, time_slot, 'cancelled');
  if (existing) {
    return res.status(400).json({ error: '该时段已被预约，请选择其他时段' });
  }

  const result = db.prepare(`
    INSERT INTO appointments (user_id, doctor_id, department_id, appointment_date, time_slot, patient_name, patient_phone, symptoms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, doctor_id, department_id, appointment_date, time_slot, patient_name, patient_phone, symptoms || '');

  // Update doctor patient count
  db.prepare('UPDATE doctors SET patient_count = patient_count + 1 WHERE id = ?').run(doctor_id);

  res.json({ message: '预约成功', appointment_id: result.lastInsertRowid });
});

// Get user appointments
router.get('/', authMiddleware, (req, res) => {
  const db = getDB();
  const appointments = db.prepare(`
    SELECT a.*, d.name as doctor_name, d.title as doctor_title, dept.name as department_name
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    JOIN departments dept ON a.department_id = dept.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `).all(req.user.id);
  res.json(appointments);
});

// Cancel appointment
router.put('/:id/cancel', authMiddleware, (req, res) => {
  const db = getDB();
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!appointment) {
    return res.status(404).json({ error: '预约不存在' });
  }
  if (appointment.status !== 'pending') {
    return res.status(400).json({ error: '只能取消待确认的预约' });
  }
  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run('cancelled', appointment.id);
  res.json({ message: '预约已取消' });
});

module.exports = router;
