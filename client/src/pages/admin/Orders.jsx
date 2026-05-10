import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'pending', label: '待付款' },
  { value: 'paid', label: '已付款' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const statusColors = {
  pending: 'bg-orange-100 text-orange-600',
  paid: 'bg-blue-100 text-blue-600',
  shipped: 'bg-purple-100 text-purple-600',
  completed: 'bg-green-100 text-green-600',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    api.get('/admin/orders').then(setOrders).catch(() => {});
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      toast.success('状态已更新');
      fetchOrders();
    } catch (err) {
      toast.error(err.error || '操作失败');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">订单管理</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl">暂无订单</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-b flex-wrap gap-2">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium">{order.order_no}</span>
                  <span className="text-gray-400">{order.user_name} (@{order.username})</span>
                  <span className="text-gray-400">{new Date(order.created_at).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[order.status] || ''}`}>
                    {statusOptions.find(s => s.value === order.status)?.label || order.status}
                  </span>
                  <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-5">
                {order.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3 mb-2 last:mb-0 text-sm">
                    <span>💊</span>
                    <span className="flex-1">{item.product_name}</span>
                    <span className="text-gray-500">×{item.quantity}</span>
                    <span className="font-medium">¥{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t flex items-center justify-between text-sm">
                <div className="text-gray-500">
                  {order.name && <span>收货人: {order.name} </span>}
                  {order.phone && <span>| {order.phone} </span>}
                  {order.address && <span>| {order.address}</span>}
                </div>
                <span className="font-bold text-red-500">¥{Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
