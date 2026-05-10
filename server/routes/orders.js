const express = require('express');
const { getDB } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', authMiddleware, (req, res) => {
  const { address, phone, name, remark } = req.body;
  const db = getDB();
  
  // Get cart items
  const cartItems = db.prepare(`
    SELECT c.*, p.name as product_name, p.price, p.image as product_image 
    FROM cart c JOIN products p ON c.product_id = p.id 
    WHERE c.user_id = ?
  `).all(req.user.id);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: '购物车为空' });
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

  const insertOrder = db.prepare('INSERT INTO orders (order_no, user_id, total_amount, address, phone, name, remark) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const result = insertOrder.run(orderNo, req.user.id, totalAmount, address || '', phone || '', name || '', remark || '');

  const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity) VALUES (?, ?, ?, ?, ?, ?)');
  cartItems.forEach(item => {
    insertItem.run(result.lastInsertRowid, item.product_id, item.product_name, item.product_image, item.price, item.quantity);
  });

  // Clear cart
  db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);

  // Update product sales
  cartItems.forEach(item => {
    db.prepare('UPDATE products SET sales = sales + ?, stock = stock - ? WHERE id = ?').run(item.quantity, item.quantity, item.product_id);
  });

  res.json({ message: '下单成功', order_no: orderNo, order_id: result.lastInsertRowid });
});

// Get user orders
router.get('/', authMiddleware, (req, res) => {
  const db = getDB();
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  
  const ordersWithItems = orders.map(order => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return { ...order, items };
  });

  res.json(ordersWithItems);
});

// Get single order
router.get('/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ ...order, items });
});

// Cancel order
router.put('/:id/cancel', authMiddleware, (req, res) => {
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }
  if (order.status !== 'pending') {
    return res.status(400).json({ error: '只能取消待付款订单' });
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', order.id);
  res.json({ message: '订单已取消' });
});

module.exports = router;
