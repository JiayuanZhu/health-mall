const api = require('../../utils/api');

Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    loading: false,
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  async onRegister() {
    const { username, password, confirmPassword, name, phone } = this.data;

    if (!username.trim()) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }
    if (!password.trim()) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' });
      return;
    }
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }
    if (!name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!phone.trim()) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      const res = await api.post('/auth/register', { username, password, name, phone });
      const app = getApp();
      app.setLoginInfo(res.token, res.user);
      wx.showToast({ title: '注册成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack({ delta: 2 });
      }, 1500);
    } catch (e) {
      console.error('register error', e);
    }
    this.setData({ loading: false });
  },

  goToLogin() {
    wx.redirectTo({ url: '/pages/login/login' });
  },
});
