import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { username, password });
      login(data.user, data.token);
      toast.success('登录成功');
      navigate('/');
    } catch (err) {
      toast.error(err.error || '登录失败');
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
              <User size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">欢迎登录</h1>
            <p className="text-gray-500 text-sm mt-1">健康医疗商城</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="用户名"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="密码"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-medical-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-medical-600 transition disabled:opacity-50">
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            还没有账号？ <Link to="/register" className="text-primary-600 hover:underline font-medium">立即注册</Link>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p className="font-medium mb-1">测试账号：</p>
            <p>管理员：admin / admin123</p>
            <p>普通用户：user1 / 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
