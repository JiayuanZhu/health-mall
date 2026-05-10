const api = require('../../utils/api');
const { resolveImageUrl } = require('../../utils/config');

Page({
  data: {
    orders: [],
    loading: true,
  },

  onShow() {
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadOrders() {
    this.setData({ loading: true });
    try {
      const orders = await api.get('/orders');
      // 给订单项图片加完整 URL
      const processed = (Array.isArray(orders) ? orders : []).map(order => {
        if (order.items) {
          order.items = order.items.map(item => {
            item.image_url = resolveImageUrl(item.product_image || item.image);
            return item;
          });
        }
        return order;
      });
      this.setData({
        orders: processed,
        loading: false,
      });
    } catch (e) {
      console.error('loadOrders error', e);
      this.setData({ loading: false });
    }
  },

  onOrderTap(e) {
    const id = e.currentTarget.dataset.id;
    // Could navigate to order detail page
  },

  onCancelOrder(e) {
    const order = e.currentTarget.dataset.order;
    wx.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.put(`/orders/${order.id}/cancel`);
            wx.showToast({ title: '已取消', icon: 'success' });
            this.loadOrders();
          } catch (e) {
            console.error('cancel order error', e);
          }
        }
      },
    });
  },

  getStatusText(status) {
    const map = {
      pending: '待处理',
      confirmed: '已确认',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消',
    };
    return map[status] || status;
  },

  getStatusClass(status) {
    const map = {
      pending: 'pending',
      confirmed: 'confirmed',
      shipped: 'confirmed',
      completed: 'completed',
      cancelled: 'cancelled',
    };
    return map[status] || 'pending';
  },
});
