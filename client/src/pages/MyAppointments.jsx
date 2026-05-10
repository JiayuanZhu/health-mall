import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const statusMap = {
  pending: { label: '待确认', color: 'text-orange-500', bg: 'bg-orange-50', icon: Clock },
  confirmed: { label: '已确认', color: 'text-blue-500', bg: 'bg-blue-50', icon: AlertCircle },
  completed: { label: '已完成', color: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'text-gray-400', bg: 'bg-gray-50', icon: XCircle },
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAppointments();
  }, [user]);

  const fetchAppointments = () => {
    api.get('/appointments').then(setAppointments).catch(() => {});
  };

  const handleCancel = async (id) => {
    if (!confirm('确定要取消此预约吗？')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('预约已取消');
      fetchAppointments();
    } catch (err) {
      toast.error(err.error || '操作失败');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">我的预约</h1>

      {appointments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar size={48} className="mx-auto mb-3" />
          <p>暂无预约记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => {
            const status = statusMap[apt.status] || statusMap.pending;
            const StatusIcon = status.icon;
            return (
              <div key={apt.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-medical-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xl">👨‍⚕️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{apt.doctor_name} <span className="text-sm font-normal text-gray-500">{apt.doctor_title}</span></h3>
                      <p className="text-sm text-gray-500 mt-0.5">{apt.department_name}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-medium ${status.color}`}>
                    <StatusIcon size={14} /> {status.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">就诊日期</p>
                    <p className="text-gray-800 font-medium">{apt.appointment_date}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">时间段</p>
                    <p className="text-gray-800 font-medium">{apt.time_slot}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">就诊人</p>
                    <p className="text-gray-800 font-medium">{apt.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">联系电话</p>
                    <p className="text-gray-800 font-medium">{apt.patient_phone}</p>
                  </div>
                </div>

                {apt.symptoms && (
                  <p className="mt-3 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">症状：{apt.symptoms}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{new Date(apt.created_at).toLocaleString('zh-CN')}</span>
                  {apt.status === 'pending' && (
                    <button onClick={() => handleCancel(apt.id)} className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-1 rounded-lg hover:border-red-200 transition">取消预约</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
