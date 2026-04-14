import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  useEffect(() => {
    fetchProducts();
  }, [category, page, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll({
        category: category || undefined,
        page,
        limit: 12,
        search: search || undefined,
      });
      setProducts(response.data.data.products || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = Object.fromEntries(searchParams);

    if (searchQuery) {
      params.search = searchQuery;
    } else {
      delete params.search;
    }

    params.page = 1;
    setSearchParams(params);
  };

  const handleCategoryChange = (cat) => {
    const params = Object.fromEntries(searchParams);

    if (cat) {
      params.category = cat;
    } else {
      delete params.category;
    }

    params.page = 1;
    setSearchParams(params);
  };

  const categories = ['fruits', 'vegetables', 'grains', 'dairy'];

  return (
    <div className="container-main">
      <h1 className="text-4xl font-bold mb-8">Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`block w-full text-left px-3 py-2 rounded ${
                  !category ? 'bg-primary text-white' : 'hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`block w-full text-left px-3 py-2 rounded capitalize ${
                    category === cat ? 'bg-primary text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <form onSubmit={handleSearchSubmit} className="flex w-full md:w-1/2 gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="w-full rounded border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark"
              >
                Search
              </button>
            </form>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map((product) => (
                  <Link key={product.id} to={`/products/${product.id}`}>
                    <div className="card h-full hover:scale-105 transition">
                      {/* Product Image */}
                      <div className="w-full h-48 bg-gray-200 rounded mb-4 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={`http://localhost:5000${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>

                      <div className="flex items-center gap-1 mb-2">
                        <FiStar className="text-yellow-400" />
                        <span className="font-semibold">
                          {product.rating ? product.rating.toFixed(1) : 'No'} ratings
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex justify-between items-center mt-4">
                        <div>
                          <span className="font-bold text-lg text-primary">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-sm ml-2">/ {product.unit}</span>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          Stock: {product.quantity}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page - 1 })}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: p })}
                      className={`px-4 py-2 rounded ${
                        page === p ? 'bg-primary text-white' : 'border hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page + 1 })}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
