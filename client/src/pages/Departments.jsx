import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import api from '../utils/api';

export default function Departments() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get('/departments').then(setDepartments).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">预约挂号</h1>
        <p className="text-gray-500 mt-1">选择科室，预约专家门诊</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(dept => (
          <Link key={dept.id} to={`/departments/${dept.id}`}
            className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition group">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{dept.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition">{dept.name}</h3>
                  {dept.is_hot ? <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">热门</span> : null}
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{dept.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-primary-600 flex items-center gap-1">
                    <Users size={12} /> 预约就诊
                  </span>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-600 transition" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
