const api = require('../../utils/api');
const { attachImageUrls } = require('../../utils/config');

Page({
  data: {
    products: [],
    categories: [],
    keyword: '',
    selectedCategory: null,
    page: 1,
    limit: 20,
    total: 0,
    loading: false,
    loadingMore: false,
    hasMore: true,
  },

  onLoad() {
    this.loadCategories();
    this.loadProducts();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, products: [], hasMore: true });
    this.loadProducts().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  async loadCategories() {
    try {
      const categories = await api.get('/products/meta/categories');
      this.setData({ categories: Array.isArray(categories) ? categories : [] });
    } catch (e) {
      console.error('loadCategories error', e);
    }
  },

  async loadProducts() {
    this.setData({ loading: true });
    try {
      let url = `/products?page=${this.data.page}&limit=${this.data.limit}`;
      if (this.data.selectedCategory) {
        url += `&category_id=${this.data.selectedCategory}`;
      }
      if (this.data.keyword) {
        url += `&keyword=${encodeURIComponent(this.data.keyword)}`;
      }
      const res = await api.get(url);
      const products = res.products || res || [];
      this.setData({
        products: this.data.page === 1 ? attachImageUrls(products) : [...this.data.products, ...attachImageUrls(products)],
        total: res.total || products.length,
        hasMore: products.length >= this.data.limit,
        loading: false,
      });
    } catch (e) {
      console.error('loadProducts error', e);
      this.setData({ loading: false });
    }
  },

  async loadMore() {
    this.setData({ loadingMore: true, page: this.data.page + 1 });
    await this.loadProducts();
    this.setData({ loadingMore: false });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.setData({ page: 1, products: [], hasMore: true });
    this.loadProducts();
  },

  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id;
    const selected = this.data.selectedCategory === id ? null : id;
    this.setData({ selectedCategory: selected, page: 1, products: [], hasMore: true });
    this.loadProducts();
  },

  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },

  onAddCart(e) {
    const product = e.currentTarget.dataset.product;
    const app = getApp();
    if (!app.checkLogin()) return;

    api.post('/cart', { product_id: product.id, quantity: 1 }).then(() => {
      wx.showToast({ title: '已加入购物车', icon: 'success' });
    }).catch(() => {});
  },

  goToCart() {
    const app = getApp();
    if (!app.checkLogin()) return;
    wx.navigateTo({ url: '/pages/cart/cart' });
  },

  // 外部调用：从首页分类跳转
  filterByCategory(categoryId) {
    this.setData({ selectedCategory: categoryId, page: 1, products: [], hasMore: true });
    this.loadProducts();
  },
});
