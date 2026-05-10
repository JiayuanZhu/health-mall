import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Calendar, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/login');
    }
  }, [user, isAdmin]);

  if (!user || !isAdmin) return null;

  const links = [
    { path: '/admin', icon: LayoutDashboard, label: '控制台', exact: true },
    { path: '/admin/products', icon: Package, label: '药品管理' },
    { path: '/admin/orders', icon: ShoppingBag, label: '订单管理' },
    { path: '/admin/appointments', icon: Calendar, label: '预约管理' },
    { path: '/admin/users', icon: Users, label: '用户管理' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">管理后台</h2>
          <p className="text-xs text-gray-400">健康医疗商城</p>
        </div>
        <nav className="flex-1 py-4">
          {links.map(({ path, icon: Icon, label, exact }) => {
            const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                  isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition">
            <ArrowLeft size={16} /> 返回前台
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-medium text-gray-800">管理后台</h1>
          <span className="text-sm text-gray-500">欢迎, {user.name}</span>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
