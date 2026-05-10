const api = require('../../utils/api');

Page({
  data: {
    department: null,
    doctors: [],
    loading: true,
  },

  onLoad(options) {
    if (options.id) {
      this.loadDepartment(options.id);
    }
  },

  async loadDepartment(id) {
    this.setData({ loading: true });
    try {
      const department = await api.get(`/departments/${id}`);
      this.setData({
        department,
        doctors: department.doctors || [],
        loading: false,
      });
      wx.setNavigationBarTitle({ title: department.name || '科室详情' });
    } catch (e) {
      console.error('loadDepartment error', e);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onDoctorTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/doctor-detail/doctor-detail?id=${id}` });
  },
});
