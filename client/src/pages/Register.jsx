import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Phone, UserPlus } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.name) {
      toast.error('请填写必要信息');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('两次密码输入不一致');
      return;
    }
    if (form.password.length < 6) {
      toast.error('密码至少6位');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post('/auth/register', {
        username: form.username,
        password: form.password,
        name: form.name,
        phone: form.phone
      });
      login(data.user, data.token);
      toast.success('注册成功');
      navigate('/');
    } catch (err) {
      toast.error(err.error || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-medical-500 rounded-full mx-auto flex items-center justify-center mb-3">
              <UserPlus size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">注册账号</h1>
            <p className="text-gray-500 text-sm mt-1">加入健康医疗商城</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                placeholder="用户名 *" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="真实姓名 *" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="手机号码" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                placeholder="密码 * (至少6位)" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})}
                placeholder="确认密码 *" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-medical-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-medical-600 transition disabled:opacity-50">
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            已有账号？ <Link to="/login" className="text-primary-600 hover:underline font-medium">去登录</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
