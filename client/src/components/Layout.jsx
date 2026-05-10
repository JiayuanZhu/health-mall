import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Home, Pill, Building2, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-medical-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-600 text-xl font-bold">+</span>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">健康医疗商城</h1>
              <p className="text-xs text-primary-100">您的健康管家</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-1 hover:text-primary-200 transition text-sm">
              <Home size={16} /> 首页
            </Link>
            <Link to="/products" className="flex items-center gap-1 hover:text-primary-200 transition text-sm">
              <Pill size={16} /> 药品商城
            </Link>
            <Link to="/departments" className="flex items-center gap-1 hover:text-primary-200 transition text-sm">
              <Building2 size={16} /> 预约挂号
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative hover:text-primary-200 transition">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-1 hover:text-primary-200 transition text-sm">
                  <User size={16} /> {user.name}
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 hover:text-primary-200 transition text-sm">
                    <Settings size={16} /> 管理
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-1 hover:text-primary-200 transition text-sm">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-white text-primary-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary-50 transition">
                登录
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-primary-500/30">
          <div className="flex justify-around py-2">
            <Link to="/" className="flex flex-col items-center text-xs gap-0.5">
              <Home size={18} /> 首页
            </Link>
            <Link to="/products" className="flex flex-col items-center text-xs gap-0.5">
              <Pill size={18} /> 药品
            </Link>
            <Link to="/departments" className="flex flex-col items-center text-xs gap-0.5">
              <Building2 size={18} /> 挂号
            </Link>
            <Link to="/cart" className="flex flex-col items-center text-xs gap-0.5 relative">
              <ShoppingCart size={18} /> 购物车
              {cartCount > 0 && (
                <span className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="flex flex-col items-center text-xs gap-0.5">
              <User size={18} /> 我的
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="text-white font-medium mb-3">关于我们</h3>
              <p>健康医疗商城致力于为用户提供便捷的药品购买和医疗预约服务，让健康触手可及。</p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-3">服务保障</h3>
              <ul className="space-y-1">
                <li>✓ 正品保障 假一赔十</li>
                <li>✓ 药师在线 专业指导</li>
                <li>✓ 快速配送 全城覆盖</li>
                <li>✓ 隐私保护 安全放心</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-3">联系方式</h3>
              <ul className="space-y-1">
                <li>客服热线：400-888-8888</li>
                <li>服务时间：8:00-22:00</li>
                <li>邮箱：service@healthmall.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs">
            © 2024 健康医疗商城 版权所有 | 互联网药品信息服务资格证书
          </div>
        </div>
      </footer>
    </div>
  );
}
