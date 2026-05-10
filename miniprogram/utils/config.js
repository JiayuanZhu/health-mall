// 健康商城小程序配置文件
const config = {
  // API基础地址，可根据环境修改
  BASE_URL: 'http://localhost:3001',
  // API前缀
  API_PREFIX: '/api',
  // 存储键名
  TOKEN_KEY: 'health_mall_token',
  USER_KEY: 'health_mall_user',
};

/**
 * 将后端返回的相对图片路径转为完整 URL
 * 例: /images/medicine-1.jpg → http://localhost:3001/images/medicine-1.jpg
 */
function resolveImageUrl(path, defaultPath) {
  const p = path || defaultPath || '/images/medicine-1.jpg';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return config.BASE_URL + p;
}

/**
 * 给产品/订单等对象添加 image_url 字段
 */
function attachImageUrl(item, imageField = 'image') {
  if (!item) return item;
  item.image_url = resolveImageUrl(item[imageField]);
  return item;
}

/**
 * 批量处理数组
 */
function attachImageUrls(list, imageField = 'image') {
  if (!Array.isArray(list)) return list;
  return list.map(item => attachImageUrl(item, imageField));
}

config.resolveImageUrl = resolveImageUrl;
config.attachImageUrl = attachImageUrl;
config.attachImageUrls = attachImageUrls;

module.exports = config;
