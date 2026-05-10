const api = require('../../utils/api');

Page({
  data: {
    departments: [],
    loading: true,
  },

  onLoad() {
    this.loadDepartments();
  },

  onPullDownRefresh() {
    this.loadDepartments().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadDepartments() {
    this.setData({ loading: true });
    try {
      const departments = await api.get('/departments');
      this.setData({
        departments: Array.isArray(departments) ? departments : [],
        loading: false,
      });
    } catch (e) {
      console.error('loadDepartments error', e);
      this.setData({ loading: false });
    }
  },

  onDepartmentTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/department-detail/department-detail?id=${id}` });
  },
});
