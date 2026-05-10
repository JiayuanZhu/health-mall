const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../server/health-mall.db');
const db = new Database(dbPath);

// Update product images
const productImages = {
  1: '/images/medicine-1.png',  // 复方氨酚烷胺片 - 感冒
  2: '/images/medicine-1.png',  // 感冒灵颗粒 - 感冒
  3: '/images/medicine-3.png',  // 板蓝根颗粒 - 中药
  4: '/images/medicine-2.png',  // 布洛芬缓释胶囊 - 止痛
  5: '/images/medicine-2.png',  // 对乙酰氨基酚片 - 止痛
  6: '/images/medicine-3.png',  // 健胃消食片 - 消化
  7: '/images/medicine-3.png',  // 奥美拉唑 - 消化
  8: '/images/medicine-4.png',  // 复方丹参滴丸 - 心脑血管
  9: '/images/medicine-4.png',  // 阿司匹林 - 心脑血管
  10: '/images/medicine-6.png', // 皮炎平 - 皮肤
  11: '/images/medicine-3.png', // 维生素C - 保健
  12: '/images/medicine-3.png', // 钙尔奇 - 保健
  13: '/images/medicine-1.png', // 小儿氨酚 - 儿童
  14: '/images/medicine-4.png', // 妇科千金片
  15: '/images/medicine-5.png', // 珍视明 - 眼科
  16: '/images/medicine-3.png', // 六味地黄丸 - 中药
  17: '/images/medicine-1.png', // 金嗓子 - 感冒
  18: '/images/medicine-6.png', // 云南白药 - 皮肤
};

const updateProduct = db.prepare('UPDATE products SET image = ? WHERE id = ?');
for (const [id, img] of Object.entries(productImages)) {
  updateProduct.run(img, parseInt(id));
}
console.log('✅ Updated product images');

// Update doctor avatars
const doctorAvatars = {
  1: '/images/doctor-1.png',
  2: '/images/doctor-2.png',
  3: '/images/doctor-1.png',
  4: '/images/doctor-2.png',
  5: '/images/doctor-1.png',
  6: '/images/doctor-1.png',
  7: '/images/doctor-2.png',
  8: '/images/doctor-1.png',
  9: '/images/doctor-1.png',
  10: '/images/doctor-2.png',
};

const updateDoctor = db.prepare('UPDATE doctors SET avatar = ? WHERE id = ?');
for (const [id, avatar] of Object.entries(doctorAvatars)) {
  updateDoctor.run(avatar, parseInt(id));
}
console.log('✅ Updated doctor avatars');

// Update department images
const deptImages = {
  1: '/images/department-1.png',
  2: '/images/department-1.png',
  3: '/images/department-1.png',
  4: '/images/department-1.png',
  5: '/images/department-1.png',
  6: '/images/department-1.png',
  7: '/images/department-1.png',
  8: '/images/department-1.png',
  9: '/images/department-1.png',
  10: '/images/department-1.png',
};

const updateDept = db.prepare('UPDATE departments SET image = ? WHERE id = ?');
for (const [id, img] of Object.entries(deptImages)) {
  updateDept.run(img, parseInt(id));
}
console.log('✅ Updated department images');

// Update banners
db.prepare('UPDATE banners SET image = ? WHERE id = 1').run('/images/banner-1.png');
db.prepare('UPDATE banners SET image = ? WHERE id = 2').run('/images/banner-2.png');
db.prepare('UPDATE banners SET image = ? WHERE id = 3').run('/images/banner-3.png');
console.log('✅ Updated banner images');

db.close();
console.log('Done!');
