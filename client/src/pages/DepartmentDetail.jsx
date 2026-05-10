import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Users, Clock } from 'lucide-react';
import api from '../utils/api';

export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    api.get(`/departments/${id}`).then(setDepartment).catch(() => navigate('/departments'));
  }, [id]);

  if (!department) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm">
        <ArrowLeft size={16} /> 返回
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{department.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{department.name}</h1>
            <p className="text-gray-500 mt-1">{department.description}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-800 mb-4">科室医生</h2>

      {department.doctors && department.doctors.length > 0 ? (
        <div className="space-y-4">
          {department.doctors.map(doctor => (
            <Link key={doctor.id} to={`/doctors/${doctor.id}`}
              className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition group">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 shadow">
                  <img src={doctor.avatar || '/images/doctor-1.jpg'} alt={doctor.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition">{doctor.name}</h3>
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded">{doctor.title}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">擅长：{doctor.specialty}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500" /> {doctor.rating}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {doctor.patient_count}人就诊</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> ¥{doctor.consultation_fee}挂号费</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="inline-block px-4 py-1.5 bg-primary-500 text-white text-sm rounded-lg group-hover:bg-primary-600 transition">预约</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">暂无医生信息</div>
      )}
    </div>
  );
}
