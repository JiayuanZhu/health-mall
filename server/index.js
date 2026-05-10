const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const departmentRoutes = require('./routes/departments');
const doctorRoutes = require('./routes/doctors');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const bannerRoutes = require('./routes/banners');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database
initDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '健康医疗商城API运行正常' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`健康医疗商城后端服务运行在 http://0.0.0.0:${PORT}`);
});
