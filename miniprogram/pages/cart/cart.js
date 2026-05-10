const api = require('../../utils/api');
const { attachImageUrls } = require('../../utils/config');

Page({
  data: {
    cartItems: [],
    loading: true,
    totalPrice: 0,
    // Checkout form
    showCheckout: false,
    address: '',
    phone: '',
    name: '',
    remark: '',
    submitting: false,
  },

  onShow() {
    const app = getApp();
    if (app.isLoggedIn()) {
      this.loadCart();
    } else {
      this.setData({ loading: false });
    }
  },

  async loadCart() {
    this.setData({ loading: true });
    try {
      const cartItems = await api.get('/cart');
      const items = attachImageUrls(Array.isArray(cartItems) ? cartItems : []);
      const totalPrice = items.reduce((sum, item) => {
        return sum + (parseFloat(item.price || item.product_price || 0) * (item.quantity || 1));
      }, 0);
      this.setData({
        cartItems: items,
        totalPrice: totalPrice.toFixed(2),
        loading: false,
      });
    } catch (e) {
      console.error('loadCart error', e);
      this.setData({ loading: false });
    }
  },

  async onQuantityMinus(e) {
    const item = e.currentTarget.dataset.item;
    if (item.quantity <= 1) {
      this.onRemoveItem(e);
      return;
    }
    try {
      await api.put(`/cart/${item.id}`, { quantity: item.quantity - 1 });
      this.loadCart();
    } catch (e) {
      console.error('update cart error', e);
    }
  },

  async onQuantityPlus(e) {
    const item = e.currentTarget.dataset.item;
    try {
      await api.put(`/cart/${item.id}`, { quantity: item.quantity + 1 });
      this.loadCart();
    } catch (e) {
      console.error('update cart error', e);
    }
  },

  onRemoveItem(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${item.product_name || item.name || '该商品'}"吗？`,
      confirmColor: '#ef4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.del(`/cart/${item.id}`);
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadCart();
          } catch (e) {
            console.error('delete cart item error', e);
          }
        }
      },
    });
  },

  onClearCart() {
    wx.showModal({
      title: '清空购物车',
      content: '确定要清空所有商品吗？',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.del('/cart');
            wx.showToast({ title: '已清空', icon: 'success' });
            this.loadCart();
          } catch (e) {
            console.error('clear cart error', e);
          }
        }
      },
    });
  },

  toggleCheckout() {
    if (this.data.cartItems.length === 0) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }
    this.setData({ showCheckout: !this.data.showCheckout });
  },

  onAddressInput(e) {
    this.setData({ address: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  async onSubmitOrder() {
    const { address, phone, name, remark } = this.data;
    if (!address.trim()) {
      wx.showToast({ title: '请输入收货地址', icon: 'none' });
      return;
    }
    if (!phone.trim()) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' });
      return;
    }
    if (!name.trim()) {
      wx.showToast({ title: '请输入收货人姓名', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      await api.post('/orders', { address, phone, name, remark });
      wx.showToast({ title: '下单成功', icon: 'success' });
      this.setData({
        showCheckout: false,
        address: '',
        phone: '',
        name: '',
        remark: '',
        submitting: false,
      });
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/orders/orders' });
      }, 1500);
    } catch (e) {
      console.error('submit order error', e);
      this.setData({ submitting: false });
    }
  },

  onProductTap(e) {
    const id = e.currentTarget.dataset.productId;
    if (id) {
      wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
    }
  },
});
