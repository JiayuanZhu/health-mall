const api = require('../../utils/api');

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    menuItems: [
      { icon: '📦', title: '我的订单', url: '/pages/orders/orders' },
      { icon: '📋', title: '我的预约', url: '/pages/appointments/appointments' },
      { icon: '🛒', title: '购物车', url: '/pages/cart/cart' },
    ],
  },

  onShow() {
    const app = getApp();
    this.setData({
      isLoggedIn: app.isLoggedIn(),
      userInfo: app.globalData.userInfo,
    });
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  goToRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  },

  onMenuTap(e) {
    const url = e.currentTarget.dataset.url;
    const app = getApp();
    if (!app.checkLogin()) return;
    wx.navigateTo({ url });
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.clearLoginInfo();
          this.setData({
            isLoggedIn: false,
            userInfo: null,
          });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      },
    });
  },
});
