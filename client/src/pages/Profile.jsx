import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Calendar, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api.get('/auth/profile').then(data => {
      setProfile(data);
      setForm({ name: data.name, phone: data.phone || '', email: data.email || '' });
    }).catch(() => {});
  }, [user]);

  const handleSave = async () => {
    try {
      await api.put('/auth/profile', form);
      toast.success('更新成功');
      setEditing(false);
      setProfile({ ...profile, ...form });
    } catch (err) {
      toast.error(err.error || '更新失败');
    }
  };

  if (!user) return null;

  const menuItems = [
    { icon: ShoppingBag, label: '我的订单', path: '/orders', desc: '查看所有订单' },
    { icon: Calendar, label: '我的预约', path: '/appointments', desc: '查看预约记录' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile card */}
      <div className="bg-gradient-to-r from-primary-500 to-medical-500 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile?.name || user.name}</h1>
            <p className="text-white/80 text-sm mt-0.5">@{user.username}</p>
            {isAdmin && <span className="inline-block mt-1 text-xs bg-white/20 px-2 py-0.5 rounded">管理员</span>}
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">个人信息</h2>
          <button onClick={() => setEditing(!editing)} className="text-sm text-primary-600 hover:underline">
            {editing ? '取消' : '编辑'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">姓名</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-sm text-gray-500">手机</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-sm text-gray-500">邮箱</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button onClick={handleSave} className="w-full py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition">保存</button>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">用户名</span>
              <span className="text-gray-800">{user.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">姓名</span>
              <span className="text-gray-800">{profile?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">手机</span>
              <span className="text-gray-800">{profile?.phone || '未设置'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">邮箱</span>
              <span className="text-gray-800">{profile?.email || '未设置'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {menuItems.map((item, idx) => (
          <Link key={idx} to={item.path} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
            <item.icon size={20} className="text-primary-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        ))}
        {isAdmin && (
          <Link to="/admin" className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition">
            <Settings size={20} className="text-primary-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">管理后台</p>
              <p className="text-xs text-gray-400">进入管理控制台</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        )}
      </div>

      <button onClick={() => { logout(); navigate('/'); }}
        className="w-full py-3 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition font-medium">
        退出登录
      </button>
    </div>
  );
}
