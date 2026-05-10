const config = require('./utils/config');

App({
  globalData: {
    token: null,
    userInfo: null,
  },

  onLaunch() {
    // 从本地存储恢复登录状态
    const token = wx.getStorageSync(config.TOKEN_KEY);
    const userInfo = wx.getStorageSync(config.USER_KEY);
    if (token) {
      this.globalData.token = token;
    }
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  // 设置登录信息
  setLoginInfo(token, user) {
    this.globalData.token = token;
    this.globalData.userInfo = user;
    wx.setStorageSync(config.TOKEN_KEY, token);
    wx.setStorageSync(config.USER_KEY, user);
  },

  // 清除登录信息
  clearLoginInfo() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    wx.removeStorageSync(config.TOKEN_KEY);
    wx.removeStorageSync(config.USER_KEY);
  },

  // 检查是否已登录
  isLoggedIn() {
    return !!this.globalData.token;
  },

  // 需要登录时的检查
  checkLogin() {
    if (!this.isLoggedIn()) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/login/login' });
      }, 1500);
      return false;
    }
    return true;
  },
});
