import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const statusColors = {
  pending: 'bg-orange-100 text-orange-600',
  confirmed: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    api.get('/admin/appointments').then(setAppointments).catch(() => {});
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/appointments/${id}/status`, { status });
      toast.success('状态已更新');
      fetchAppointments();
    } catch (err) {
      toast.error(err.error || '操作失败');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">预约管理</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">ID</th>
                <th className="px-4 py-3 text-left text-gray-600">预约用户</th>
                <th className="px-4 py-3 text-left text-gray-600">科室</th>
                <th className="px-4 py-3 text-left text-gray-600">医生</th>
                <th className="px-4 py-3 text-left text-gray-600">预约日期</th>
                <th className="px-4 py-3 text-left text-gray-600">时间段</th>
                <th className="px-4 py-3 text-left text-gray-600">就诊人</th>
                <th className="px-4 py-3 text-left text-gray-600">联系电话</th>
                <th className="px-4 py-3 text-left text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">{apt.id}</td>
                  <td className="px-4 py-3">{apt.user_name}</td>
                  <td className="px-4 py-3">{apt.department_name}</td>
                  <td className="px-4 py-3 font-medium">{apt.doctor_name} <span className="text-xs text-gray-400">{apt.doctor_title}</span></td>
                  <td className="px-4 py-3">{apt.appointment_date}</td>
                  <td className="px-4 py-3">{apt.time_slot}</td>
                  <td className="px-4 py-3">{apt.patient_name}</td>
                  <td className="px-4 py-3">{apt.patient_phone}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[apt.status] || ''}`}>
                      {statusOptions.find(s => s.value === apt.status)?.label || apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={apt.status} onChange={e => handleStatusChange(apt.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {appointments.length === 0 && (
          <div className="text-center py-12 text-gray-400">暂无预约记录</div>
        )}
      </div>
    </div>
  );
}
