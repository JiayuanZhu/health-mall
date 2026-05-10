import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ArrowLeft, Package, Shield, Truck } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then(setProduct).catch(() => navigate('/products'));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, quantity);
      toast.success('已加入购物车');
    } catch (err) {
      toast.error(err.error || '操作失败');
    }
  };

  if (!product) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm">
        <ArrowLeft size={16} /> 返回
      </button>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="md:flex">
          {/* Product image */}
          <div className="md:w-2/5 h-64 md:h-auto bg-gradient-to-br from-primary-50 to-medical-50 flex items-center justify-center p-6">
            <img src={product.image || '/images/medicine-1.jpg'} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Product info */}
          <div className="md:w-3/5 p-6">
            <div className="flex items-start gap-2">
              {product.is_hot ? <span className="shrink-0 bg-red-500 text-white text-xs px-2 py-0.5 rounded">热门</span> : null}
              {product.is_new ? <span className="shrink-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded">新品</span> : null}
              <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            </div>
            
            <p className="text-gray-500 mt-2">{product.description}</p>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-red-500">¥{product.price}</span>
              {product.original_price > product.price && (
                <span className="text-lg text-gray-400 line-through">¥{product.original_price}</span>
              )}
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p><span className="text-gray-400 w-16 inline-block">规　格：</span>{product.spec}</p>
              <p><span className="text-gray-400 w-16 inline-block">厂　家：</span>{product.manufacturer}</p>
              <p><span className="text-gray-400 w-16 inline-block">分　类：</span>{product.category_name}</p>
              <p><span className="text-gray-400 w-16 inline-block">库　存：</span>{product.stock > 0 ? `有货 (${product.stock}件)` : '暂时缺货'}</p>
              <p><span className="text-gray-400 w-16 inline-block">销　量：</span>已售 {product.sales} 件</p>
            </div>

            {/* Quantity selector */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm text-gray-600">数量：</span>
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className="flex-1 bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed">
                <ShoppingCart size={18} /> 加入购物车
              </button>
            </div>

            {/* Service badges */}
            <div className="mt-6 flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Shield size={14} className="text-green-500" /> 正品保障</span>
              <span className="flex items-center gap-1"><Truck size={14} className="text-blue-500" /> 快速配送</span>
              <span className="flex items-center gap-1"><Package size={14} className="text-orange-500" /> 无忧退换</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
