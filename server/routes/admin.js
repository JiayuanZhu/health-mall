const express = require('express');
const { getDB } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// ===== Product Management =====
router.get('/products', (req, res) => {
  const db = getDB();
  const products = db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC').all();
  res.json(products);
});

router.post('/products', (req, res) => {
  const { name, category_id, price, original_price, description, image, spec, manufacturer, stock, is_hot, is_new } = req.body;
  const db = getDB();
  const result = db.prepare(`
    INSERT INTO products (name, category_id, price, original_price, description, image, spec, manufacturer, stock, is_hot, is_new) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, category_id, price, original_price || price, description || '', image || '', spec || '', manufacturer || '', stock || 100, is_hot ? 1 : 0, is_new ? 1 : 0);
  res.json({ message: '药品添加成功', id: result.lastInsertRowid });
});

router.put('/products/:id', (req, res) => {
  const { name, category_id, price, original_price, description, image, spec, manufacturer, stock, is_hot, is_new, status } = req.body;
  const db = getDB();
  db.prepare(`
    UPDATE products SET name=?, category_id=?, price=?, original_price=?, description=?, image=?, spec=?, manufacturer=?, stock=?, is_hot=?, is_new=?, status=?
    WHERE id=?
  `).run(name, category_id, price, original_price, description, image, spec, manufacturer, stock, is_hot ? 1 : 0, is_new ? 1 : 0, status !== undefined ? status : 1, req.params.id);
  res.json({ message: '药品更新成功' });
});

router.delete('/products/:id', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: '药品已删除' });
});

// ===== Order Management =====
router.get('/orders', (req, res) => {
  const db = getDB();
  const orders = db.prepare(`
    SELECT o.*, u.username, u.name as user_name 
    FROM orders o JOIN users u ON o.user_id = u.id 
    ORDER BY o.created_at DESC
  `).all();
  const ordersWithItems = orders.map(order => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return { ...order, items };
  });
  res.json(ordersWithItems);
});

router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const db = getDB();
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: '订单状态已更新' });
});

// ===== Appointment Management =====
router.get('/appointments', (req, res) => {
  const db = getDB();
  const appointments = db.prepare(`
    SELECT a.*, d.name as doctor_name, d.title as doctor_title, dept.name as department_name, u.name as user_name
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    JOIN departments dept ON a.department_id = dept.id
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
  `).all();
  res.json(appointments);
});

router.put('/appointments/:id/status', (req, res) => {
  const { status } = req.body;
  const db = getDB();
  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: '预约状态已更新' });
});

// ===== User Management =====
router.get('/users', (req, res) => {
  const db = getDB();
  const users = db.prepare('SELECT id, username, name, phone, email, role, created_at FROM users ORDER BY id DESC').all();
  res.json(users);
});

router.put('/users/:id/role', (req, res) => {
  const { role } = req.body;
  const db = getDB();
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ message: '用户角色已更新' });
});

router.delete('/users/:id', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: '用户已删除' });
});

// ===== Dashboard Stats =====
router.get('/stats', (req, res) => {
  const db = getDB();
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const appointmentCount = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != ?').get('cancelled').total;
  res.json({ productCount, orderCount, appointmentCount, userCount, totalRevenue });
});

module.exports = router;
