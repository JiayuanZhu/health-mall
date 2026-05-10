import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Calendar, Users, DollarSign } from 'lucide-react';
import api from '../../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/admin/stats').then(setStats).catch(() => {});
  }, []);

  const cards = [
    { icon: Package, label: '药品总数', value: stats.productCount || 0, color: 'from-blue-500 to-blue-600' },
    { icon: ShoppingBag, label: '订单总数', value: stats.orderCount || 0, color: 'from-green-500 to-green-600' },
    { icon: Calendar, label: '预约总数', value: stats.appointmentCount || 0, color: 'from-purple-500 to-purple-600' },
    { icon: Users, label: '用户总数', value: stats.userCount || 0, color: 'from-orange-500 to-orange-600' },
    { icon: DollarSign, label: '营收总额', value: `¥${Number(stats.totalRevenue || 0).toFixed(2)}`, color: 'from-red-500 to-red-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">控制台</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${card.color} rounded-xl p-5 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon size={36} className="text-white/30" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4">快速操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '药品管理', desc: '添加/编辑药品', link: '/admin/products', emoji: '💊' },
            { label: '订单管理', desc: '处理订单', link: '/admin/orders', emoji: '📦' },
            { label: '预约管理', desc: '管理预约', link: '/admin/appointments', emoji: '📅' },
            { label: '用户管理', desc: '管理用户', link: '/admin/users', emoji: '👥' },
          ].map((item, idx) => (
            <a key={idx} href={item.link} className="block p-4 border border-gray-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/50 transition text-center">
              <span className="text-3xl">{item.emoji}</span>
              <p className="font-medium text-gray-800 text-sm mt-2">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
