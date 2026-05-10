const api = require('../../utils/api');
const { attachImageUrl } = require('../../utils/config');

Page({
  data: {
    product: null,
    quantity: 1,
    loading: true,
  },

  onLoad(options) {
    if (options.id) {
      this.loadProduct(options.id);
    }
  },

  async loadProduct(id) {
    this.setData({ loading: true });
    try {
      const product = await api.get(`/products/${id}`);
      this.setData({ product: attachImageUrl(product), loading: false });
      wx.setNavigationBarTitle({ title: product.name || '药品详情' });
    } catch (e) {
      console.error('loadProduct error', e);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onQuantityMinus() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 });
    }
  },

  onQuantityPlus() {
    this.setData({ quantity: this.data.quantity + 1 });
  },

  onAddToCart() {
    const app = getApp();
    if (!app.checkLogin()) return;

    api.post('/cart', {
      product_id: this.data.product.id,
      quantity: this.data.quantity,
    }).then(() => {
      wx.showToast({ title: '已加入购物车', icon: 'success' });
    }).catch(() => {});
  },

  goToCart() {
    const app = getApp();
    if (!app.checkLogin()) return;
    wx.navigateTo({ url: '/pages/cart/cart' });
  },
});
