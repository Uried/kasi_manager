import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, updateProductInventory } from '../../services/productService';
import { formatImageUrl } from '../../services/fileService';
import type { Product } from '../../services/productService';

const ProductInventory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [editingProduct, setEditingProduct] = useState<{id: string, stock: number} | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [page, limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(page, limit);
      setProducts(response.products);
      setTotal(response.total);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des produits:', err);
      setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (id: string, value: string) => {
    const stock = parseInt(value, 10);
    if (!isNaN(stock) && stock >= 0) {
      setEditingProduct({ id, stock });
    }
  };

  const handleSaveStock = async (id: string) => {
    if (!editingProduct || editingProduct.id !== id) return;
    
    try {
      await updateProductInventory(id, { stock: editingProduct.stock });
      
      // Mettre à jour le produit dans la liste locale
      setProducts(products.map(product => 
        product.id === id || product._id === id 
          ? { ...product, stock: editingProduct.stock } 
          : product
      ));
      
      setSuccessMessage(`Stock du produit mis à jour avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setEditingProduct(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du stock:', err);
      setError('Impossible de mettre à jour le stock. Veuillez réessayer plus tard.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getProductId = (product: Product): string => {
    return product.id || product._id || '';
  };

  const getMainCategory = (product: Product): string => {
    if (!product.categories || !Array.isArray(product.categories) || product.categories.length === 0) {
      return 'Non catégorisé';
    }
    
    const category = product.categories[0];
    if (typeof category === 'object' && category.name) {
      return category.name;
    } else if (typeof category === 'string') {
      return category;
    }
    
    return 'Non catégorisé';
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/products')}
            className="bg-white hover:bg-gray-50 text-gray-600 p-2 rounded-md border border-gray-200 transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-medium text-gray-700">Gestion de l'inventaire</h1>
        </div>
      </div>

      {/* Messages de succès ou d'erreur */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tableau d'inventaire */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock actuel
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nouveau stock
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={getProductId(product)} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-3 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                      <img 
                        src={product.images && product.images.length > 0 ? formatImageUrl(product.images[0]) : '/placeholder.svg'} 
                        alt={product.name} 
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">
                    {getMainCategory(product)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-medium text-gray-900">{product.price.toLocaleString('fr-FR')} FCFA</div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.stock > 10 
                      ? 'bg-green-50 text-green-700' 
                      : product.stock > 0 
                        ? 'bg-yellow-50 text-yellow-700' 
                        : 'bg-red-50 text-red-700'
                  }`}>
                    {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <input
                    type="number"
                    min="0"
                    className="w-32 px-3 py-1.5 border border-gray-300 rounded-md text-center text-gray-900"
                    defaultValue={product.stock}
                    onChange={(e) => handleStockChange(getProductId(product), e.target.value)}
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleSaveStock(getProductId(product))}
                    disabled={!editingProduct || editingProduct.id !== getProductId(product)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      editingProduct && editingProduct.id === getProductId(product)
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    } transition-colors duration-150`}
                  >
                    Enregistrer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 bg-white rounded-lg shadow sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Précédent
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{(page - 1) * limit + 1}</span> à{' '}
                <span className="font-medium">{Math.min(page * limit, total)}</span> sur{' '}
                <span className="font-medium">{total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === i + 1
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Suivant</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInventory;
