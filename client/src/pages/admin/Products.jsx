import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', category_id: '', price: '', original_price: '', description: '',
    spec: '', manufacturer: '', stock: 100, is_hot: false, is_new: false
  });

  useEffect(() => {
    fetchProducts();
    api.get('/products/meta/categories').then(setCategories).catch(() => {});
  }, []);

  const fetchProducts = () => {
    api.get('/admin/products').then(setProducts).catch(() => {});
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: '', category_id: '', price: '', original_price: '', description: '', spec: '', manufacturer: '', stock: 100, is_hot: false, is_new: false });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category_id: product.category_id || '',
      price: product.price,
      original_price: product.original_price || '',
      description: product.description || '',
      spec: product.spec || '',
      manufacturer: product.manufacturer || '',
      stock: product.stock,
      is_hot: !!product.is_hot,
      is_new: !!product.is_new,
      status: product.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('请填写药品名称和价格');
      return;
    }
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, form);
        toast.success('更新成功');
      } else {
        await api.post('/admin/products', form);
        toast.success('添加成功');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.error || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除此药品吗？')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('已删除');
      fetchProducts();
    } catch (err) {
      toast.error(err.error || '删除失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">药品管理</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition text-sm">
          <Plus size={16} /> 添加药品
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">ID</th>
                <th className="px-4 py-3 text-left text-gray-600">药品名称</th>
                <th className="px-4 py-3 text-left text-gray-600">分类</th>
                <th className="px-4 py-3 text-left text-gray-600">价格</th>
                <th className="px-4 py-3 text-left text-gray-600">库存</th>
                <th className="px-4 py-3 text-left text-gray-600">销量</th>
                <th className="px-4 py-3 text-left text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3 font-medium">
                    {p.name}
                    {p.is_hot ? <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1 rounded">热</span> : ''}
                    {p.is_new ? <span className="ml-1 text-[10px] bg-green-100 text-green-600 px-1 rounded">新</span> : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category_name}</td>
                  <td className="px-4 py-3 text-red-500 font-medium">¥{p.price}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.sales}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${p.status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {p.status ? '上架' : '下架'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg">{editingProduct ? '编辑药品' : '添加药品'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">药品名称 *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">分类</label>
                  <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">选择分类</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">规格</label>
                  <input type="text" value={form.spec} onChange={e => setForm({...form, spec: e.target.value})}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">售价 *</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">原价</label>
                  <input type="number" step="0.01" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">库存</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">生产厂家</label>
                  <input type="text" value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">描述</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_hot} onChange={e => setForm({...form, is_hot: e.target.checked})} className="rounded" />
                  热门推荐
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_new} onChange={e => setForm({...form, is_new: e.target.checked})} className="rounded" />
                  新品标签
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">取消</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
