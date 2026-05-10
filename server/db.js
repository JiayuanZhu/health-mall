const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'health-mall.db');
let db;

function getDB() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const db = getDB();

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      role TEXT DEFAULT 'user',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Product categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `);

  // Products (medicines)
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      price REAL NOT NULL,
      original_price REAL,
      description TEXT,
      image TEXT,
      spec TEXT,
      manufacturer TEXT,
      stock INTEGER DEFAULT 100,
      sales INTEGER DEFAULT 0,
      is_hot INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Departments
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      image TEXT,
      is_hot INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    )
  `);

  // Doctors
  db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department_id INTEGER,
      title TEXT,
      specialty TEXT,
      description TEXT,
      avatar TEXT,
      consultation_fee REAL DEFAULT 0,
      rating REAL DEFAULT 5.0,
      patient_count INTEGER DEFAULT 0,
      available_slots TEXT,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    )
  `);

  // Cart
  db.exec(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      address TEXT,
      phone TEXT,
      name TEXT,
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Order items
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_image TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Appointments
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      department_id INTEGER NOT NULL,
      appointment_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      patient_phone TEXT NOT NULL,
      symptoms TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id),
      FOREIGN KEY (department_id) REFERENCES departments(id)
    )
  `);

  // Banners
  db.exec(`
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      image TEXT NOT NULL,
      link TEXT,
      sort_order INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1
    )
  `);

  // Seed data
  seedData(db);
}

function seedData(db) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return; // Already seeded

  // Create admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const userPassword = bcrypt.hashSync('123456', 10);

  db.prepare(`INSERT INTO users (username, password, name, phone, role) VALUES (?, ?, ?, ?, ?)`).run(
    'admin', hashedPassword, '系统管理员', '13800000000', 'admin'
  );
  db.prepare(`INSERT INTO users (username, password, name, phone, role) VALUES (?, ?, ?, ?, ?)`).run(
    'user1', userPassword, '张三', '13800000001', 'user'
  );

  // Categories
  const categories = [
    ['感冒用药', '🤧'],
    ['止痛退热', '🌡️'],
    ['消化系统', '🫃'],
    ['心脑血管', '❤️'],
    ['皮肤用药', '🧴'],
    ['维生素保健', '💊'],
    ['儿童用药', '👶'],
    ['妇科用药', '👩'],
    ['眼科用药', '👁️'],
    ['中药养生', '🌿']
  ];
  const insertCategory = db.prepare('INSERT INTO categories (name, icon) VALUES (?, ?)');
  categories.forEach(([name, icon]) => insertCategory.run(name, icon));

  // Products
  const products = [
    ['复方氨酚烷胺片', 1, 15.80, 22.00, '用于感冒引起的头痛、发热、鼻塞、流涕等症状', '', '12片/盒', '华润三九医药', 200, 1580, 1, 0],
    ['感冒灵颗粒', 1, 12.50, 18.00, '解热镇痛，用于感冒引起的头痛、发热', '', '10袋/盒', '华润三九医药', 300, 2100, 1, 0],
    ['板蓝根颗粒', 1, 8.90, 12.00, '清热解毒，凉血利咽，用于肺胃热盛所致的咽喉肿痛', '', '20袋/盒', '广州白云山', 500, 3200, 1, 1],
    ['布洛芬缓释胶囊', 2, 24.50, 32.00, '用于各种原因引起的轻至中度疼痛', '', '20粒/盒', '中美天津史克', 150, 980, 1, 0],
    ['对乙酰氨基酚片', 2, 6.80, 9.50, '用于发热及缓解轻至中度疼痛', '', '24片/瓶', '西安杨森', 400, 1200, 0, 0],
    ['健胃消食片', 3, 18.90, 25.00, '健胃消食，用于脾胃虚弱所致的食积胀满', '', '36片/瓶', '江中药业', 250, 1650, 1, 0],
    ['奥美拉唑肠溶胶囊', 3, 28.00, 35.00, '用于胃溃疡、十二指肠溃疡、反流性食管炎', '', '14粒/盒', '阿斯利康', 180, 890, 0, 1],
    ['复方丹参滴丸', 4, 25.00, 32.00, '活血化瘀，理气止痛，用于冠心病引起的胸闷', '', '180粒/瓶', '天津天士力', 160, 760, 1, 0],
    ['阿司匹林肠溶片', 4, 15.60, 20.00, '用于预防心脑血管疾病', '', '30片/盒', '拜耳医药', 220, 1100, 0, 0],
    ['皮炎平软膏', 5, 12.90, 16.00, '用于局限性瘙痒症、神经性皮炎等皮肤病', '', '20g/支', '华润三九医药', 300, 950, 0, 0],
    ['维生素C片', 6, 9.90, 15.00, '补充维生素C，增强免疫力', '', '100片/瓶', '善存', 600, 4200, 1, 1],
    ['钙尔奇碳酸钙D3片', 6, 68.00, 89.00, '补充钙质和维生素D3，预防骨质疏松', '', '60片/瓶', '辉瑞', 120, 650, 1, 0],
    ['小儿氨酚黄那敏颗粒', 7, 10.50, 14.00, '用于小儿感冒引起的发热、头痛、流涕', '', '12袋/盒', '仁和药业', 280, 1800, 1, 0],
    ['妇科千金片', 8, 32.00, 42.00, '清热除湿，益气化瘀，用于湿热下注所致的带下病', '', '108片/盒', '株洲千金', 140, 520, 0, 0],
    ['珍视明滴眼液', 9, 16.80, 22.00, '缓解视疲劳，用于青少年假性近视', '', '15ml/瓶', '江西珍视明', 350, 2800, 1, 0],
    ['六味地黄丸', 10, 22.50, 30.00, '滋阴补肾，用于肾阴亏损所致的头晕耳鸣', '', '360粒/瓶', '同仁堂', 200, 1350, 1, 0],
    ['金嗓子喉片', 1, 7.50, 10.00, '疏风清热，解毒利咽，用于急性咽炎', '', '12片/盒', '金嗓子', 400, 2500, 0, 1],
    ['云南白药气雾剂', 5, 35.00, 45.00, '活血散瘀，消肿止痛，用于跌打损伤', '', '60g+50g/盒', '云南白药', 180, 980, 1, 0]
  ];
  const insertProduct = db.prepare(`
    INSERT INTO products (name, category_id, price, original_price, description, image, spec, manufacturer, stock, sales, is_hot, is_new) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  products.forEach(p => insertProduct.run(...p));

  // Departments
  const departments = [
    ['内科', '诊治各类内科疾病，包括呼吸内科、消化内科、心血管内科等', '🏥', '', 1],
    ['外科', '各类外科手术和疾病诊治，包括普外科、骨科、泌尿外科等', '🔪', '', 1],
    ['妇产科', '妇科疾病诊治、产前检查、分娩及产后康复', '👶', '', 1],
    ['儿科', '新生儿至青少年各类疾病的诊治和保健', '🧒', '', 1],
    ['骨科', '骨折、关节疾病、脊柱疾病的诊治和康复', '🦴', '', 1],
    ['眼科', '各类眼部疾病的诊断和治疗，包括屈光不正、白内障等', '👁️', '', 0],
    ['口腔科', '牙齿疾病、口腔黏膜病变的诊治及正畸修复', '🦷', '', 0],
    ['皮肤科', '各类皮肤病、性传播疾病的诊断和治疗', '🧴', '', 0],
    ['中医科', '运用中医理论和方法诊治各类慢性病和亚健康状态', '🌿', '', 1],
    ['心理科', '心理咨询、心理治疗和精神类疾病的诊治', '🧠', '', 0]
  ];
  const insertDept = db.prepare('INSERT INTO departments (name, description, icon, image, is_hot) VALUES (?, ?, ?, ?, ?)');
  departments.forEach(d => insertDept.run(...d));

  // Doctors
  const doctors = [
    ['张明华', 1, '主任医师', '呼吸系统疾病、慢性咳嗽', '从医30年，擅长呼吸系统疑难杂症的诊治，在慢性阻塞性肺病、支气管哮喘等领域有丰富经验', '', 50, 4.9, 12800, '["08:00-09:00","09:00-10:00","10:00-11:00","14:00-15:00","15:00-16:00"]'],
    ['李婷婷', 1, '副主任医师', '消化系统疾病、胃肠镜', '消化内科专家，擅长胃肠道疾病的内镜诊断和治疗', '', 35, 4.8, 8600, '["08:00-09:00","09:00-10:00","14:00-15:00","15:00-16:00"]'],
    ['王建国', 2, '主任医师', '腹腔镜手术、肝胆外科', '普外科资深专家，微创手术经验丰富', '', 60, 4.9, 15200, '["08:00-09:00","09:00-10:00","10:00-11:00"]'],
    ['陈雪梅', 3, '主任医师', '高危妊娠、妇科肿瘤', '妇产科领军专家，擅长复杂妇科手术和高危产科处理', '', 55, 4.9, 11500, '["09:00-10:00","10:00-11:00","14:00-15:00"]'],
    ['刘德伟', 4, '副主任医师', '小儿呼吸、小儿消化', '儿科临床经验丰富，深受家长信赖', '', 30, 4.7, 9800, '["08:00-09:00","09:00-10:00","10:00-11:00","14:00-15:00","15:00-16:00","16:00-17:00"]'],
    ['赵志强', 5, '主任医师', '关节置换、运动损伤', '骨科手术专家，尤其擅长膝关节和髋关节置换手术', '', 50, 4.8, 7600, '["08:00-09:00","09:00-10:00","14:00-15:00"]'],
    ['孙丽萍', 6, '副主任医师', '白内障、青光眼', '眼科专家，完成白内障手术超过5000例', '', 40, 4.8, 6800, '["09:00-10:00","10:00-11:00","14:00-15:00","15:00-16:00"]'],
    ['周伟', 7, '主治医师', '牙齿正畸、口腔种植', '口腔医学博士，精通各类正畸和种植技术', '', 25, 4.6, 4200, '["08:00-09:00","09:00-10:00","10:00-11:00","14:00-15:00","15:00-16:00"]'],
    ['吴芳', 9, '主任医师', '中医内科、中医调理', '国家级名老中医学术继承人，擅长慢病调理', '', 45, 4.9, 10200, '["08:00-09:00","09:00-10:00","10:00-11:00"]'],
    ['林小明', 10, '副主任医师', '焦虑抑郁、睡眠障碍', '心理科专家，十余年临床心理治疗经验', '', 35, 4.7, 3500, '["09:00-10:00","10:00-11:00","14:00-15:00","15:00-16:00","16:00-17:00"]']
  ];
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (name, department_id, title, specialty, description, avatar, consultation_fee, rating, patient_count, available_slots) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  doctors.forEach(d => insertDoctor.run(...d));

  // Banners
  const banners = [
    ['春季健康大促', 'https://via.placeholder.com/1200x400/0ea5e9/ffffff?text=春季健康大促+全场满100减20', '/products', 1],
    ['在线问诊', 'https://via.placeholder.com/1200x400/10b981/ffffff?text=名医在线+足不出户看名医', '/departments', 2],
    ['新人专享', 'https://via.placeholder.com/1200x400/6366f1/ffffff?text=新用户注册+领取50元优惠券', '/register', 3]
  ];
  const insertBanner = db.prepare('INSERT INTO banners (title, image, link, sort_order) VALUES (?, ?, ?, ?)');
  banners.forEach(b => insertBanner.run(...b));

  console.log('✅ 数据库初始化完成，已导入示例数据');
}

module.exports = { getDB, initDB };
