const api = require('../../utils/api');

Page({
  data: {
    appointments: [],
    loading: true,
  },

  onShow() {
    this.loadAppointments();
  },

  onPullDownRefresh() {
    this.loadAppointments().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadAppointments() {
    this.setData({ loading: true });
    try {
      const appointments = await api.get('/appointments');
      this.setData({
        appointments: Array.isArray(appointments) ? appointments : [],
        loading: false,
      });
    } catch (e) {
      console.error('loadAppointments error', e);
      this.setData({ loading: false });
    }
  },

  onCancelAppointment(e) {
    const appointment = e.currentTarget.dataset.appointment;
    wx.showModal({
      title: '取消预约',
      content: '确定要取消该预约吗？',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.put(`/appointments/${appointment.id}/cancel`);
            wx.showToast({ title: '已取消', icon: 'success' });
            this.loadAppointments();
          } catch (e) {
            console.error('cancel appointment error', e);
          }
        }
      },
    });
  },
});
