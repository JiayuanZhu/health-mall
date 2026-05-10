const config = require('./config');

/**
 * 封装wx.request的通用请求方法
 * 自动处理token、错误提示等
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync(config.TOKEN_KEY);
    const header = {
      'Content-Type': 'application/json',
    };
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    wx.request({
      url: `${config.BASE_URL}${config.API_PREFIX}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: Object.assign(header, options.header || {}),
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // token过期或无效，清除登录状态
          wx.removeStorageSync(config.TOKEN_KEY);
          wx.removeStorageSync(config.USER_KEY);
          const app = getApp();
          app.globalData.token = null;
          app.globalData.userInfo = null;
          wx.showToast({
            title: '请重新登录',
            icon: 'none',
          });
          setTimeout(() => {
            wx.navigateTo({ url: '/pages/login/login' });
          }, 1500);
          reject(res);
        } else {
          const msg = (res.data && res.data.error) || '请求失败';
          wx.showToast({ title: msg, icon: 'none' });
          reject(res);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
        reject(err);
      },
    });
  });
}

// 便捷方法
function get(url, data) {
  return request({ url, method: 'GET', data });
}

function post(url, data) {
  return request({ url, method: 'POST', data });
}

function put(url, data) {
  return request({ url, method: 'PUT', data });
}

function del(url, data) {
  return request({ url, method: 'DELETE', data });
}

module.exports = { request, get, post, put, del };
