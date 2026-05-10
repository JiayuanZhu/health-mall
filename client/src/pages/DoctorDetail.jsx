import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Users, Clock, Calendar, Phone, User } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [form, setForm] = useState({
    appointment_date: '',
    time_slot: '',
    patient_name: '',
    patient_phone: '',
    symptoms: ''
  });

  useEffect(() => {
    api.get(`/doctors/${id}`).then(setDoctor).catch(() => navigate('/departments'));
  }, [id]);

  const getAvailableSlots = () => {
    if (!doctor?.available_slots) return [];
    try {
      return JSON.parse(doctor.available_slots);
    } catch { return []; }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }
    if (!form.appointment_date || !form.time_slot || !form.patient_name || !form.patient_phone) {
      toast.error('请填写完整预约信息');
      return;
    }
    try {
      await api.post('/appointments', {
        doctor_id: doctor.id,
        department_id: doctor.department_id,
        ...form
      });
      toast.success('预约成功！');
      setShowBooking(false);
      setForm({ appointment_date: '', time_slot: '', patient_name: '', patient_phone: '', symptoms: '' });
    } catch (err) {
      toast.error(err.error || '预约失败');
    }
  };

  if (!doctor) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>;

  const slots = getAvailableSlots();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm">
        <ArrowLeft size={16} /> 返回
      </button>

      {/* Doctor info card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 shadow-md">
            <img src={doctor.avatar || '/images/doctor-1.jpg'} alt={doctor.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800">{doctor.name}</h1>
              <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">{doctor.title}</span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{doctor.department_name}</span>
            </div>
            <p className="text-gray-500 mt-2">擅长：{doctor.specialty}</p>
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">{doctor.description}</p>
            <div className="flex items-center gap-6 mt-4">
              <span className="flex items-center gap-1 text-sm"><Star size={16} className="text-yellow-500" /> <strong>{doctor.rating}</strong> 评分</span>
              <span className="flex items-center gap-1 text-sm"><Users size={16} className="text-primary-500" /> <strong>{doctor.patient_count}</strong> 人就诊</span>
              <span className="flex items-center gap-1 text-sm"><Clock size={16} className="text-green-500" /> ¥<strong>{doctor.consultation_fee}</strong> 挂号费</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={() => setShowBooking(!showBooking)}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition">
            {showBooking ? '收起预约表单' : '立即预约挂号'}
          </button>
        </div>
      </div>

      {/* Booking form */}
      {showBooking && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} /> 预约挂号
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">预约日期 *</label>
                <input type="date" min={getMinDate()} value={form.appointment_date}
                  onChange={e => setForm({...form, appointment_date: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">时间段 *</label>
                <select value={form.time_slot} onChange={e => setForm({...form, time_slot: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">请选择时间段</option>
                  {slots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">就诊人姓名 *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" value={form.patient_name}
                    onChange={e => setForm({...form, patient_name: e.target.value})}
                    placeholder="请输入真实姓名"
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系电话 *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="tel" value={form.patient_phone}
                    onChange={e => setForm({...form, patient_phone: e.target.value})}
                    placeholder="请输入联系电话"
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">症状描述</label>
              <textarea value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})}
                placeholder="请简要描述您的症状（选填）"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>
            <button type="submit" className="w-full py-3 bg-medical-500 text-white rounded-xl font-medium hover:bg-medical-600 transition">
              确认预约
            </button>
          </form>
        </div>
      )}

      {/* Available time slots */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">出诊时间</h2>
        <div className="flex flex-wrap gap-2">
          {slots.map(slot => (
            <span key={slot} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">{slot}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
