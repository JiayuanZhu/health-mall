import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, Filter } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    api.get('/products/meta/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchParams]);

  const fetchProducts = async () => {
    const params = {};
    if (selectedCategory) params.category_id = selectedCategory;
    if (searchParams.get('keyword')) params.keyword = searchParams.get('keyword');
    try {
      const data = await api.get('/products', { params });
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(keyword ? { keyword, ...(selectedCategory && { category: selectedCategory }) } : (selectedCategory ? { category: selectedCategory } : {}));
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    const params = {};
    if (catId) params.category = catId;
    if (keyword) params.keyword = keyword;
    setSearchParams(params);
  };

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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="搜索药品名称..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium">
            搜索
          </button>
        </div>
      </form>

      <div className="flex gap-6">
        {/* Category sidebar */}
        <aside className="hidden md:block w-48 shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Filter size={16} /> 药品分类
            </h3>
            <ul className="space-y-1">
              <li>
                <button onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!selectedCategory ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  全部分类
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button onClick={() => handleCategoryChange(String(cat.id))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedCategory === String(cat.id) ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {cat.icon} {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {/* Mobile category filter */}
          <div className="md:hidden mb-4 flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => handleCategoryChange('')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs ${!selectedCategory ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border'}`}>
              全部
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => handleCategoryChange(String(cat.id))}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs ${selectedCategory === String(cat.id) ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border'}`}>
                {cat.name}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-4">共找到 {total} 种药品</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <Link key={product.id} to={`/products/${product.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group">
                <div className="h-36 bg-gradient-to-br from-primary-50 to-medical-50 flex items-center justify-center relative overflow-hidden">
                  <img src={product.image || '/images/medicine-1.jpg'} alt={product.name} className="h-full w-full object-cover" />
                  {product.is_hot ? <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">热门</span> : null}
                  {product.is_new ? <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded">新品</span> : null}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 text-sm truncate group-hover:text-primary-600">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">{product.spec} | {product.manufacturer}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-red-500 font-bold text-sm">¥{product.price}</span>
                      {product.original_price > product.price && (
                        <span className="text-[10px] text-gray-400 line-through ml-1">¥{product.original_price}</span>
                      )}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); handleAddToCart(product.id); }}
                      className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition">
                      <ShoppingCart size={12} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p>暂无符合条件的药品</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
