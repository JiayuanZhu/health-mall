const api = require('../../utils/api');
const { attachImageUrls } = require('../../utils/config');

Page({
  data: {
    banners: [],
    categories: [],
    hotProducts: [],
    hotDepartments: [],
    loading: true,
    services: [
      { icon: '🏥', name: '在线挂号', desc: '便捷预约' },
      { icon: '💊', name: '药品购买', desc: '正品保障' },
      { icon: '👨‍⚕️', name: '专家问诊', desc: '专业服务' },
      { icon: '🚚', name: '送药上门', desc: '快速配送' },
    ],
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadData() {
    this.setData({ loading: true });
    try {
      const [banners, categories, hotProducts, hotDepartments] = await Promise.all([
        api.get('/banners').catch(() => []),
        api.get('/products/meta/categories').catch(() => []),
        api.get('/products?is_hot=1&limit=8').catch(() => ({ products: [] })),
        api.get('/departments?is_hot=1').catch(() => []),
      ]);

      this.setData({
        banners: attachImageUrls(Array.isArray(banners) ? banners : [], 'image'),
        categories: Array.isArray(categories) ? categories : [],
        hotProducts: attachImageUrls(hotProducts.products || hotProducts || []),
        hotDepartments: Array.isArray(hotDepartments) ? hotDepartments : [],
        loading: false,
      });
    } catch (e) {
      console.error('loadData error', e);
      this.setData({ loading: false });
    }
  },

  onBannerTap(e) {
    const banner = e.currentTarget.dataset.banner;
    if (banner && banner.link) {
      wx.navigateTo({ url: banner.link });
    }
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    wx.switchTab({
      url: '/pages/products/products',
      success() {
        const pages = getCurrentPages();
        const productsPage = pages[pages.length - 1];
        if (productsPage && productsPage.filterByCategory) {
          productsPage.filterByCategory(category.id);
        }
      },
    });
  },

  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },

  onDepartmentTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/department-detail/department-detail?id=${id}` });
  },

  goToProducts() {
    wx.switchTab({ url: '/pages/products/products' });
  },

  goToDepartments() {
    wx.switchTab({ url: '/pages/departments/departments' });
  },
});
