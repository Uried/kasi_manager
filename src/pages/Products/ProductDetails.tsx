import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../../services/productService';
import { formatImageUrl } from '../../services/fileService';

import type { Product } from '../../services/productService';

// Interface pour les dimensions du produit
interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

// Interface étendue pour les propriétés supplémentaires du produit
interface ExtendedProduct extends Product {
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);
        
        // Définir la première image comme image active
        if (productData.images && productData.images.length > 0) {
          setActiveImage(productData.images[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération du produit:', err);
        setError('Impossible de charger les détails du produit. Veuillez réessayer plus tard.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fonction pour obtenir la catégorie principale d'un produit
  const getMainCategory = (product: ExtendedProduct): string => {
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

  // Fonction pour formater le prix en FCFA
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('fr-FR')} FCFA`;
  };

  if (loading) {
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

  if (error || !product) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Erreur</h3>
        <p className="mt-1 text-gray-500">{error || "Produit non trouvé"}</p>
        <div className="mt-6">
          <button 
            onClick={() => navigate('/products')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md flex items-center text-sm mx-auto border border-blue-200 transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la liste des produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation et actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/products')}
            className="bg-white hover:bg-gray-50 text-gray-600 p-2 rounded-md border border-gray-200 transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-medium text-gray-700">Détails du produit</h1>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate(`/products/edit/${id}`)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-md flex items-center text-sm border border-indigo-200 transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Modifier
          </button>
          <button className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md flex items-center text-sm border border-red-200 transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Galerie d'images */}
        <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-700">Images du produit</h2>
          </div>
          <div className="p-6">
            <div className="max-w-md mx-auto aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img 
                src={activeImage ? formatImageUrl(activeImage) : '/placeholder.svg'} 
                alt={product.name} 
                className="object-contain w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden cursor-pointer border-2 ${activeImage === image ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => setActiveImage(image)}
                  >
                    <img 
                      src={formatImageUrl(image)} 
                      alt={`${product.name} - image ${index + 1}`} 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-5 text-center py-8 text-gray-500">
                  Aucune image disponible pour ce produit
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations du produit */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-700">Informations</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nom du produit</h3>
              <p className="mt-1 text-base text-gray-900">{product.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Prix</h3>
              <p className="mt-1 text-base text-gray-900 font-semibold">{formatPrice(product.price)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  {getMainCategory(product)}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Stock</h3>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.stock > 10 
                    ? 'bg-green-50 text-green-700' 
                    : product.stock > 0 
                      ? 'bg-yellow-50 text-yellow-700' 
                      : 'bg-red-50 text-red-700'
                }`}>
                  {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{product.description || "Aucune description disponible"}</p>
            </div>
            
            {/* Caractéristiques supplémentaires */}
            {product.details && Object.keys(product.details).length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Caractéristiques</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
                  {Object.entries(product.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-sm text-gray-500">{key}</dt>
                      <dd className="text-sm font-medium text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Détails techniques */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-700">Détails techniques</h2>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
              <div className="flex justify-between py-1">
                <dt className="text-sm text-gray-500">SKU</dt>
                <dd className="text-sm font-medium text-gray-900">{product.sku || "-"}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-sm text-gray-500">Poids</dt>
                <dd className="text-sm font-medium text-gray-900">{product.weight ? `${product.weight} kg` : "-"}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-sm text-gray-500">Dimensions</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {product.dimensions ? 
                    `${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height} cm` : 
                    "-"}
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-sm text-gray-500">Date de création</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString('fr-FR') : "-"}
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-sm text-gray-500">Dernière mise à jour</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('fr-FR') : "-"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* SEO et métadonnées */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-700">SEO et métadonnées</h2>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Titre SEO</dt>
                <dd className="text-sm text-gray-900">{product.seo?.metaTitle || product.name || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Description SEO</dt>
                <dd className="text-sm text-gray-900">{product.seo?.metaDescription || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Mots-clés</dt>
                <dd>
                  {product.seo?.keywords && product.seo.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.seo.keywords.map((keyword, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
