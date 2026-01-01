import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../services/productService';
import { formatImageUrl } from '../../services/fileService';

// Import des types avec la syntaxe type-only pour respecter verbatimModuleSyntax
import type { Product, Category } from '../../services/productService';

// Interface pour les SKUs des produits
interface ProductSku {
  id: string;
  sku: string;
  product: string;
  createdAt: string;
  updatedAt: string;
}

const ProductsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // États pour les données de l'API
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(10);

  // Suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; _id?: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Récupération des produits depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts(currentPage, productsPerPage);
        setProducts(response.products);
        setTotalItems(response.total);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des produits:', err);
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, productsPerPage]);

  // Ouvrir le modal de suppression
  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete({ id: getProductId(product), name: product.name });
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    const productId = productToDelete?._id || productToDelete?.id;
    if (!productId) return;
    try {
      setIsDeleting(true);
      await deleteProduct(productId);
      // Mettre à jour la liste localement
      setProducts((prev) => prev.filter((p) => getProductId(p) !== productId));
      setTotalItems((prev) => Math.max(0, prev - 1));
      handleCloseDeleteModal();
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      // Optionnel: afficher une notification d'erreur
    } finally {
      setIsDeleting(false);
    }
  };

  // Extraction des catégories uniques pour le filtre
  const categoriesMap = new Map<string, string>();
  products.forEach((product: Product) => {
    if (Array.isArray(product.categories)) {
      product.categories.forEach((category: string | Category) => {
        if (typeof category === 'object' && category.name) {
          categoriesMap.set(category._id, category.name);
        }
      });
    }
  });
  const categories = Array.from(categoriesMap.values());

  // Filtrage et tri des produits
  const filteredProducts = products
    .filter((product: Product) => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (selectedCategory === '' || 
        (Array.isArray(product.categories) && product.categories.some((cat: string | Category) => 
          typeof cat === 'object' ? cat.name === selectedCategory : false
        ))
      )
    )
    .sort((a: Product, b: Product) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price-asc') {
        return a.price - b.price;
      } else if (sortBy === 'price-desc') {
        return b.price - a.price;
      } else if (sortBy === 'stock') {
        return a.stock - b.stock;
      }
      return 0;
    });

  // Pagination logic
  const totalPages = Math.ceil(totalItems / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, totalItems);
  const currentProducts = filteredProducts;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Gestion de la sélection en masse
  const toggleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map(product => product.id || product._id || ''));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };
  
  // Fonction pour obtenir l'ID du produit (compatible avec MongoDB _id)
  const getProductId = (product: Product): string => {
    return product.id || product._id || '';
  };
  
  // Fonction pour obtenir la catégorie principale d'un produit
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
  
  // Fonction pour obtenir le SKU d'un produit
  const getProductSku = (product: Product): string => {
    // Dans un cas réel, vous pourriez avoir une propriété SKU dans votre modèle de produit
    // Ici, nous générons un SKU basé sur le nom du produit
    // La propriété sku n'existe pas dans le type Product, donc nous générons toujours un SKU
    const namePrefix = product.name.substring(0, 3).toUpperCase();
    const idSuffix = (product.id || product._id || '').substring(0, 5);
    return `${namePrefix}-${idSuffix}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-medium text-gray-700">Liste des produits</h1>
        <button 
          onClick={() => navigate('/products/add')}
          className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md flex items-center text-sm border border-blue-200 transition-colors duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter un produit
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-md border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-blue-100 focus:border-blue-300 sm:text-sm transition-colors duration-150"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-sm rounded-md text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres
            </button>
            
            <select
              className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-sm rounded-md text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-colors duration-150"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Trier par nom</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="stock">Stock</option>
            </select>
            
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-sm rounded-md text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Exporter
            </button>
          </div>
        </div>
        
        {/* Advanced filters */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-xs font-medium text-gray-500 mb-1">Catégorie</label>
              <select
                id="category"
                className="block w-full pl-3 pr-10 py-1.5 text-sm border-gray-200 focus:outline-none focus:ring-blue-100 focus:border-blue-300 rounded-md transition-colors duration-150"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="stock" className="block text-xs font-medium text-gray-500 mb-1">Stock</label>
              <select
                id="stock"
                className="block w-full pl-3 pr-10 py-1.5 text-sm border-gray-200 focus:outline-none focus:ring-blue-100 focus:border-blue-300 rounded-md transition-colors duration-150"
              >
                <option>Tous</option>
                <option>En stock</option>
                <option>Stock faible</option>
                <option>Rupture de stock</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                className="w-full bg-gray-50 text-gray-600 hover:bg-gray-100 px-4 py-1.5 rounded-md text-sm border border-gray-200 transition-colors duration-150"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSortBy('name');
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {currentProducts.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between mb-4">
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                onChange={toggleSelectAll}
              />
              <span className="text-sm text-gray-700">Tout sélectionner</span>
            </label>
          </div>
          {selectedProducts.length > 0 && (
            <div className="flex items-center">
              <span className="text-indigo-700 font-medium mr-4">{selectedProducts.length} produit(s) sélectionné(s)</span>
              <div className="flex gap-2">
                <button className="bg-white text-gray-700 border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50">
                  Modifier
                </button>
                <button className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded text-sm hover:bg-red-100">
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-500 focus:ring-indigo-400 border-gray-300 rounded"
                  checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentProducts.map((product) => (
              <tr key={getProductId(product)} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-3 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-500 focus:ring-indigo-400 border-gray-300 rounded"
                    checked={selectedProducts.includes(getProductId(product))}
                    onChange={() => toggleSelectProduct(getProductId(product))}
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center cursor-pointer" onClick={() => navigate(`/products/${getProductId(product)}`)}>  
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
                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-150">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">
                    {getMainCategory(product)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {getProductSku(product)}
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
                <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => navigate(`/products/${getProductId(product)}`)} 
                      style={{backgroundColor: '#EFF6FF', borderColor: '#DBEAFE'}} 
                      className="p-1.5 !bg-blue-50 rounded-md border !border-blue-100 hover:!bg-blue-100 transition-colors duration-150"
                      title="Voir les détails"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 !text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: '#2563EB'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => navigate(`/products/edit/${getProductId(product)}`)} 
                      style={{backgroundColor: '#EEF2FF', borderColor: '#E0E7FF'}} 
                      className="p-1.5 !bg-indigo-50 rounded-md border !border-indigo-100 hover:!bg-indigo-100 transition-colors duration-150"
                      title="Modifier le produit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 !text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: '#4F46E5'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(product)}
                      style={{backgroundColor: '#FEF2F2', borderColor: '#FEE2E2'}} 
                      className="p-1.5 !bg-red-50 rounded-md border !border-red-100 hover:!bg-red-100 transition-colors duration-150"
                      title="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 !text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: '#DC2626'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      )}
      
      {/* État d'erreur */}
      {!loading && error && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Erreur</h3>
          <p className="mt-1 text-gray-500">{error}</p>
          <div className="mt-6">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md flex items-center text-sm mx-auto border border-blue-200 transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réessayer
            </button>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && currentProducts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun produit trouvé</h3>
          <p className="mt-1 text-gray-500">Essayez de modifier vos filtres ou d'ajouter de nouveaux produits.</p>
          <div className="mt-6">
            <button 
              onClick={() => navigate('/products/add')}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md flex items-center text-sm mx-auto border border-blue-200 transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Ajouter un produit
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-md border border-gray-200 shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Affichage de <span className="font-medium text-gray-700">{startIndex + 1}</span> à <span className="font-medium text-gray-700">{Math.min(endIndex, filteredProducts.length)}</span> sur <span className="font-medium text-gray-700">{filteredProducts.length}</span> produits
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-200 px-2 py-1.5 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-3 py-1.5 text-sm border ${currentPage === page
                      ? 'z-10 bg-blue-50 text-blue-600 border-blue-200 font-medium'
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50 focus:z-20 focus:outline-none'
                    } transition-colors duration-150`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-200 px-2 py-1.5 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <span className="sr-only">Suivant</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    {/* Modal de confirmation de suppression */}
    {isDeleteModalOpen && productToDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30" onClick={handleCloseDeleteModal} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-100">
          <div className="p-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 3h.01M4.93 4.93l14.14 14.14M12 4.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Supprimer ce produit ?</h3>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Cette action est irréversible. Le produit <span className="font-medium text-gray-900">{productToDelete.name}</span> sera définitivement supprimé.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="flex-1 inline-flex justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    </div>
  );
};

export default ProductsList;
