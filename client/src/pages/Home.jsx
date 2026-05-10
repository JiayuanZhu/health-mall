import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, ShoppingCart, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [hotDepartments, setHotDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    api.get('/banners').then(setBanners).catch(() => {});
    api.get('/products?is_hot=1&limit=8').then(data => setHotProducts(data.products)).catch(() => {});
    api.get('/departments?is_hot=1').then(setHotDepartments).catch(() => {});
    api.get('/products/meta/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner(c => (c + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  const handleAddToCart = async (productId) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }
    try {
      await addToCart(productId);
      toast.success('已加入购物车');
    } catch (err) {
      toast.error(err.error || '操作失败');
    }
  };

  return (
    <div className="pb-8">
      {/* Banner */}
      <div className="relative h-48 md:h-80 overflow-hidden">
        {banners.length > 0 ? (
          <>
            <div className="absolute inset-0 flex transition-transform duration-500" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
              {banners.map((banner, idx) => (
                <div key={idx} className="min-w-full h-full relative">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentBanner(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition ${idx === currentBanner ? 'bg-white shadow-lg' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        ) : (
          <div className="h-full bg-gradient-to-r from-primary-500 to-medical-500 flex items-center justify-center text-white text-center px-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-3">健康医疗商城</h2>
              <p className="text-lg text-white/80">您的健康，我们守护</p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Category Icons */}
        <div className="bg-white rounded-xl shadow-sm -mt-8 relative z-10 p-4 md:p-6">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {categories.slice(0, 10).map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="flex flex-col items-center gap-1 hover:text-primary-600 transition">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs text-gray-600 truncate w-full text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Hot Products */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🔥 热门药品
            </h2>
            <Link to="/products" className="text-primary-600 text-sm flex items-center gap-1 hover:underline">
              查看更多 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hotProducts.map(product => (
              <Link key={product.id} to={`/products/${product.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group">
                <div className="h-40 bg-gradient-to-br from-primary-50 to-medical-50 flex items-center justify-center p-2 overflow-hidden">
                  <img src={product.image || '/images/medicine-1.jpg'} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 text-sm truncate group-hover:text-primary-600 transition">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{product.spec}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-red-500 font-bold">¥{product.price}</span>
                      {product.original_price > product.price && (
                        <span className="text-xs text-gray-400 line-through ml-1">¥{product.original_price}</span>
                      )}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); handleAddToCart(product.id); }}
                      className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition">
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">已售 {product.sales}件</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Hot Departments */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🏥 热门科室
            </h2>
            <Link to="/departments" className="text-primary-600 text-sm flex items-center gap-1 hover:underline">
              全部科室 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hotDepartments.map(dept => (
              <Link key={dept.id} to={`/departments/${dept.id}`}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition group">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{dept.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 group-hover:text-primary-600 transition">{dept.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dept.description}</p>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-primary-600 transition" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Service features */}
        <section className="mt-8 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🚚', title: '快速配送', desc: '全城2小时达' },
              { icon: '✅', title: '正品保障', desc: '100%正品药品' },
              { icon: '👨‍⚕️', title: '药师指导', desc: '专业用药咨询' },
              { icon: '🔒', title: '隐私保护', desc: '安全加密配送' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="font-medium text-gray-800 text-sm mt-2">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
