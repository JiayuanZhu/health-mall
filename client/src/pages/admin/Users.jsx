import { useState, useEffect } from 'react';
import { Trash2, Shield, ShieldOff } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api.get('/admin/users').then(setUsers).catch(() => {});
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('角色已更新');
      fetchUsers();
    } catch (err) {
      toast.error(err.error || '操作失败');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('确定要删除此用户吗？此操作不可撤销。')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('用户已删除');
      fetchUsers();
    } catch (err) {
      toast.error(err.error || '删除失败');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">用户管理</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">ID</th>
                <th className="px-4 py-3 text-left text-gray-600">用户名</th>
                <th className="px-4 py-3 text-left text-gray-600">姓名</th>
                <th className="px-4 py-3 text-left text-gray-600">手机</th>
                <th className="px-4 py-3 text-left text-gray-600">邮箱</th>
                <th className="px-4 py-3 text-left text-gray-600">角色</th>
                <th className="px-4 py-3 text-left text-gray-600">注册时间</th>
                <th className="px-4 py-3 text-left text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">{u.id}</td>
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleString('zh-CN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.role === 'admin' ? (
                        <button onClick={() => handleRoleChange(u.id, 'user')} title="取消管理员"
                          className="text-orange-500 hover:text-orange-700"><ShieldOff size={14} /></button>
                      ) : (
                        <button onClick={() => handleRoleChange(u.id, 'admin')} title="设为管理员"
                          className="text-purple-500 hover:text-purple-700"><Shield size={14} /></button>
                      )}
                      <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-400">暂无用户</div>
        )}
      </div>
    </div>
  );
}
