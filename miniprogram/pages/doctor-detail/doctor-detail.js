const api = require('../../utils/api');

Page({
  data: {
    doctor: null,
    loading: true,
    showBookForm: false,
    // Booking form
    appointmentDate: '',
    timeSlot: '',
    patientName: '',
    patientPhone: '',
    symptoms: '',
    timeSlots: [
      '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
      '14:00-15:00', '15:00-16:00', '16:00-17:00',
    ],
    minDate: '',
    submitting: false,
  },

  onLoad(options) {
    if (options.id) {
      this.loadDoctor(options.id);
    }
    // 设置最小日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    this.setData({ minDate });
  },

  async loadDoctor(id) {
    this.setData({ loading: true });
    try {
      const doctor = await api.get(`/doctors/${id}`);
      this.setData({ doctor, loading: false });
      wx.setNavigationBarTitle({ title: doctor.name || '医生详情' });
    } catch (e) {
      console.error('loadDoctor error', e);
      this.setData({ loading: false });
    }
  },

  toggleBookForm() {
    const app = getApp();
    if (!app.checkLogin()) return;
    this.setData({ showBookForm: !this.data.showBookForm });
  },

  onDateChange(e) {
    this.setData({ appointmentDate: e.detail.value });
  },

  onTimeSlotTap(e) {
    const slot = e.currentTarget.dataset.slot;
    this.setData({ timeSlot: slot });
  },

  onPatientNameInput(e) {
    this.setData({ patientName: e.detail.value });
  },

  onPatientPhoneInput(e) {
    this.setData({ patientPhone: e.detail.value });
  },

  onSymptomsInput(e) {
    this.setData({ symptoms: e.detail.value });
  },

  async onSubmitAppointment() {
    const { doctor, appointmentDate, timeSlot, patientName, patientPhone, symptoms } = this.data;

    if (!appointmentDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }
    if (!timeSlot) {
      wx.showToast({ title: '请选择时段', icon: 'none' });
      return;
    }
    if (!patientName.trim()) {
      wx.showToast({ title: '请输入患者姓名', icon: 'none' });
      return;
    }
    if (!patientPhone.trim()) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      await api.post('/appointments', {
        doctor_id: doctor.id,
        department_id: doctor.department_id,
        appointment_date: appointmentDate,
        time_slot: timeSlot,
        patient_name: patientName,
        patient_phone: patientPhone,
        symptoms: symptoms,
      });
      wx.showToast({ title: '预约成功', icon: 'success' });
      this.setData({
        showBookForm: false,
        appointmentDate: '',
        timeSlot: '',
        patientName: '',
        patientPhone: '',
        symptoms: '',
        submitting: false,
      });
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/appointments/appointments' });
      }, 1500);
    } catch (e) {
      console.error('submit appointment error', e);
      this.setData({ submitting: false });
    }
  },
});
