import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';

export default function Cart() {
  const { user } = useAuth();
  const { cartItems, updateQuantity, removeItem, clearCart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', address: '', remark: '' });

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-gray-500 mb-4">请先登录后查看购物车</p>
        <Link to="/login" className="inline-block bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition">去登录</Link>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.phone || !orderForm.address) {
      toast.error('请填写收货信息');
      return;
    }
    try {
      const result = await api.post('/orders', orderForm);
      toast.success('下单成功！');
      await fetchCart();
      setShowCheckout(false);
      navigate('/orders');
    } catch (err) {
      toast.error(err.error || '下单失败');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-gray-500 mb-4">购物车是空的</p>
        <Link to="/products" className="inline-block bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition">去逛逛</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">购物车</h1>
        <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition">清空购物车</button>
      </div>

      {/* Cart items */}
      <div className="space-y-3 mb-6">
        {cartItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-medical-50 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-2xl">💊</span>
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/products/${item.product_id}`} className="font-medium text-gray-800 hover:text-primary-600 truncate block">{item.name}</Link>
              <p className="text-xs text-gray-500 mt-0.5">{item.spec}</p>
              <p className="text-red-500 font-bold mt-1">¥{item.price}</p>
            </div>
            <div className="flex items-center border rounded-lg shrink-0">
              <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                <Plus size={12} />
              </button>
            </div>
            <div className="text-right shrink-0 w-20">
              <p className="font-bold text-gray-800">¥{(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition shrink-0">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Total and checkout */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">共 {cartItems.length} 种药品</span>
          <div className="text-right">
            <span className="text-gray-600">合计：</span>
            <span className="text-2xl font-bold text-red-500 ml-1">¥{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {!showCheckout ? (
          <button onClick={() => setShowCheckout(true)} className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition flex items-center justify-center gap-2">
            <ShoppingBag size={18} /> 去结算
          </button>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-gray-800">填写收货信息</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="收货人姓名 *" value={orderForm.name}
                onChange={e => setOrderForm({...orderForm, name: e.target.value})}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="tel" placeholder="联系电话 *" value={orderForm.phone}
                onChange={e => setOrderForm({...orderForm, phone: e.target.value})}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <input type="text" placeholder="收货地址 *" value={orderForm.address}
              onChange={e => setOrderForm({...orderForm, address: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <input type="text" placeholder="备注（选填）" value={orderForm.remark}
              onChange={e => setOrderForm({...orderForm, remark: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCheckout(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">取消</button>
              <button type="submit" className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition">确认下单</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
