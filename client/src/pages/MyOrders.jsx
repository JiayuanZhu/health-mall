import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const statusMap = {
  pending: { label: '待付款', color: 'text-orange-500', bg: 'bg-orange-50', icon: Clock },
  paid: { label: '已付款', color: 'text-blue-500', bg: 'bg-blue-50', icon: AlertCircle },
  shipped: { label: '已发货', color: 'text-purple-500', bg: 'bg-purple-50', icon: Package },
  completed: { label: '已完成', color: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'text-gray-400', bg: 'bg-gray-50', icon: XCircle },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrders();
  }, [user]);

  const fetchOrders = () => {
    api.get('/orders').then(setOrders).catch(() => {});
  };

  const handleCancel = async (orderId) => {
    if (!confirm('确定要取消此订单吗？')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success('订单已取消');
      fetchOrders();
    } catch (err) {
      toast.error(err.error || '操作失败');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">我的订单</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={48} className="mx-auto mb-3" />
          <p>暂无订单</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = statusMap[order.status] || statusMap.pending;
            const StatusIcon = status.icon;
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-b">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">订单号：{order.order_no}</span>
                    <span className="text-gray-400">{new Date(order.created_at).toLocaleString('zh-CN')}</span>
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-medium ${status.color}`}>
                    <StatusIcon size={14} /> {status.label}
                  </span>
                </div>
                <div className="p-5">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3 mb-3 last:mb-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-medical-50 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-lg">💊</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                        <p className="text-xs text-gray-400">¥{item.price} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-800">¥{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-t">
                  <div className="text-sm text-gray-500">
                    {order.name && <span>收货人：{order.name}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">合计：<strong className="text-red-500">¥{Number(order.total_amount).toFixed(2)}</strong></span>
                    {order.status === 'pending' && (
                      <button onClick={() => handleCancel(order.id)} className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-1 rounded-lg hover:border-red-200 transition">取消订单</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
