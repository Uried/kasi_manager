import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../../services/productService';
import type { Product } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { formatImageUrl } from '../../services/fileService';
import MediaLibrarySelector from '../../components/shared/MediaLibrarySelector';
import type { Category } from '../../services/categoryService';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // États pour le produit et le chargement
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // États pour les catégories
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // État pour la médiathèque
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  // État pour les erreurs de formulaire
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Charger les données du produit et les catégories
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Charger le produit
        const productData = await getProductById(id);
        setProduct(productData);
        
        // Initialiser les catégories sélectionnées
        const categoryIds = productData.categories.map((cat: any) => 
          typeof cat === 'string' ? cat : (cat._id || cat.id)
        );
        setSelectedCategories(categoryIds);
        
        // Initialiser les images
        if (productData.images && Array.isArray(productData.images)) {
          setImagePreviewUrls(productData.images);
        }
        
        // Charger les catégories disponibles
        const categoriesResponse = await getCategories();
        setAvailableCategories(categoriesResponse.categories);
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données du produit. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Gérer les changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!product) return;
    
    const { name, value } = e.target;
    
    // Gérer les champs imbriqués (avec des points dans le nom)
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      const parentKeyTyped = parentKey as keyof Product;
      const currentParentValue = product[parentKeyTyped] as Record<string, unknown> || {};
      
      setProduct({
        ...product,
        [parentKeyTyped]: {
          ...currentParentValue,
          [childKey]: value
        }
      });
    } else {
      // Gérer les champs simples
      setProduct({
        ...product,
        [name]: value
      });
    }
  };

  // Gérer les changements pour les champs imbriqués
  const handleNestedChange = (key: keyof Product, nestedKey: string, value: any) => {
    // Pour les objets imbriqués (details, seo)
    setProduct(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        [key]: {
          ...(prev[key] as object || {}),
          [nestedKey]: value
        }
      };
    });
  };

  // Gérer les changements de champs booléens
  const handleBooleanChange = (name: string, checked: boolean) => {
    if (!product) return;
    
    setProduct({
      ...product,
      [name]: checked
    });
  };

  // Gérer les changements de catégories
  const handleCategoryChange = (categoryId: string) => {
    const updatedCategories = [...selectedCategories];
    const index = updatedCategories.indexOf(categoryId);
    
    if (index === -1) {
      updatedCategories.push(categoryId);
    } else {
      updatedCategories.splice(index, 1);
    }
    
    setSelectedCategories(updatedCategories);
    
    if (product) {
      setProduct({
        ...product,
        categories: updatedCategories
      });
    }
  };

  // Gérer la sélection d'images depuis la médiathèque
  const handleMediaLibrarySelect = (selectedImages: string[]) => {
    // Ajouter uniquement les nouvelles images
    const newImages = selectedImages.filter(url => !imagePreviewUrls.includes(url));
    
    if (newImages.length > 0) {
      const updatedImages = [...imagePreviewUrls, ...newImages];
      setImagePreviewUrls(updatedImages);
      
      if (product) {
        setProduct({
          ...product,
          images: updatedImages
        });
      }
    }
    
    setIsMediaLibraryOpen(false);
  };

  // Supprimer une image
  const removeImage = (index: number) => {
    const updatedImages = imagePreviewUrls.filter((_, i) => i !== index);
    setImagePreviewUrls(updatedImages);
    
    if (product) {
      setProduct({
        ...product,
        images: updatedImages
      });
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!product) {
      errors.general = 'Aucun produit à mettre à jour';
      return errors;
    }
    
    if (!product.name || product.name.trim() === '') {
      errors.name = 'Le nom du produit est obligatoire';
    }
    
    if (!product.description || product.description.trim() === '') {
      errors.description = 'La description est obligatoire';
    }
    
    if (product.price <= 0) {
      errors.price = 'Le prix doit être supérieur à 0';
    }
    
    if (product.stock < 0) {
      errors.stock = 'Le stock ne peut pas être négatif';
    }
    
    if (!product.images || product.images.length === 0) {
      errors.images = 'Au moins une image est requise';
    }
    
    if (!product.categories || product.categories.length === 0) {
      errors.categories = 'Sélectionnez au moins une catégorie';
    }
    
    return errors;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !id) return;
    
    // Valider le formulaire
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setSaving(true);
      
      // Normaliser les catégories en IDs (string[])
      const normalizedCategories = (product.categories || [])
        .map((cat: any) => (typeof cat === 'string' ? cat : (cat?._id ?? cat?.id)))
        .filter((catId: unknown): catId is string => typeof catId === 'string' && catId.length > 0);
      
      const payload = {
        ...product,
        categories: normalizedCategories,
      };
      
      // Mettre à jour le produit avec payload normalisé
      await updateProduct(id, payload);
      
      setSuccessMessage('Produit mis à jour avec succès');
      setTimeout(() => {
        setSuccessMessage(null);
        navigate(`/products/${id}`);
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du produit:', err);
      setError('Impossible de mettre à jour le produit. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={() => navigate('/products')} 
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Retour à la liste des produits
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Sélecteur de médiathèque */}
      <MediaLibrarySelector
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={handleMediaLibrarySelect}
        multiple={true}
        currentSelectedImages={imagePreviewUrls}
      />

      {/* En-tête avec boutons d'action */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium text-gray-900">Modifier le produit</h1>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="#000" d="M5 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2v-5.5A1.5 1.5 0 0 1 6.5 10h6.444l1.159-1.16A2.87 2.87 0 0 1 17 8.135V6.62a2 2 0 0 0-.586-1.414l-1.621-1.621A2 2 0 0 0 13.379 3H13v3.5A1.5 1.5 0 0 1 11.5 8h-4A1.5 1.5 0 0 1 6 6.5V3zm6.944 8l-2.67 2.67a3.2 3.2 0 0 0-.841 1.485l-.375 1.498q-.044.176-.054.347H6v-5.5a.5.5 0 0 1 .5-.5zM7 3h5v3.5a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5zm7.81 6.548l-4.83 4.83a2.2 2.2 0 0 0-.578 1.02l-.375 1.498a.89.89 0 0 0 1.079 1.078l1.498-.374a2.2 2.2 0 0 0 1.02-.578l4.83-4.83a1.87 1.87 0 0 0-2.645-2.644"/></svg>
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : 'Enregistrer les modifications'}
          </button>
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

      {error && product && (
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

      {/* Formulaire d'édition */}
      {product && (
        <form className="space-y-8">
          {/* Section d'informations générales */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations du produit</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du produit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={product.name}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={product.description}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section de prix et stock */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Prix et stock</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (FCFA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  min="0"
                  step="0.01"
                  value={product.price}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                )}
              </div>

              <div>
                <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Prix remisé (FCFA)
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  id="discountPrice"
                  min="0"
                  step="0.01"
                  value={product.discountPrice || 0}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  id="stock"
                  min="0"
                  step="1"
                  value={product.stock}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border ${formErrors.stock ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {formErrors.stock && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.stock}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={product.status || 'available'}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border border-gray-300 rounded-md"
                >
                  <option value="available">Disponible</option>
                  <option value="out_of_stock">Rupture de stock</option>
                  <option value="coming_soon">Bientôt disponible</option>
                  <option value="discontinued">Discontinué</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section des images */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Images du produit</h2>
            
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setIsMediaLibraryOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Sélectionner des images
              </button>
            </div>
            
            {formErrors.images && (
              <p className="mt-1 text-sm text-red-600 mb-2">{formErrors.images}</p>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                    <img
                      src={formatImageUrl(url)}
                      alt={`Image ${index + 1}`}
                      className="object-cover object-center"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section des options */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Options du produit</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  id="isFeatured"
                  name="isFeatured"
                  type="checkbox"
                  checked={product.isFeatured || false}
                  onChange={(e) => handleBooleanChange('isFeatured', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                  Produit en vedette
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isNew"
                  name="isNew"
                  type="checkbox"
                  checked={product.isNew || false}
                  onChange={(e) => handleBooleanChange('isNew', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isNew" className="ml-2 block text-sm text-gray-900">
                  Nouveau produit
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isTrending"
                  name="isTrending"
                  type="checkbox"
                  checked={product.isTrending || false}
                  onChange={(e) => handleBooleanChange('isTrending', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isTrending" className="ml-2 block text-sm text-gray-900">
                  Produit tendance
                </label>
              </div>
            </div>
          </div>
          
          {/* Section des catégories */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Catégories</h2>
            
            {formErrors.categories && (
              <p className="mt-1 text-sm text-red-600 mb-2">{formErrors.categories}</p>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {availableCategories.map((category) => {
                const categoryId = category._id;
                const isSelected = selectedCategories.includes(categoryId);
                return (
                  <div key={categoryId} className="flex items-center">
                    <input
                      id={`category-${categoryId}`}
                      name={`category-${categoryId}`}
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryChange(categoryId)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`category-${categoryId}`} className="ml-2 block text-sm text-gray-900">
                      {category.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Section des détails du produit */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Détails du produit</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Marque
                </label>
                <input
                  type="text"
                  id="brand"
                  name="details.brand"
                  value={product.details?.brand || ''}
                  onChange={(e) => handleNestedChange('details', 'brand', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Genre
                </label>
                <select
                  id="gender"
                  name="details.gender"
                  value={product.details?.gender || ''}
                  onChange={(e) => handleNestedChange('details', 'gender', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionner</option>
                  <option value="men">Homme</option>
                  <option value="women">Femme</option>
                  <option value="unisex">Unisexe</option>
                  <option value="kids">Enfants</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                  Taille
                </label>
                <input
                  type="text"
                  id="size"
                  name="details.size"
                  value={product.details?.size || ''}
                  onChange={(e) => handleNestedChange('details', 'size', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="madeIn" className="block text-sm font-medium text-gray-700 mb-1">
                  Fabriqué en
                </label>
                <input
                  type="text"
                  id="madeIn"
                  name="details.madeIn"
                  value={product.details?.madeIn || ''}
                  onChange={(e) => handleNestedChange('details', 'madeIn', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="releaseYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Année de sortie
                </label>
                <input
                  type="number"
                  id="releaseYear"
                  name="details.releaseYear"
                  value={product.details?.releaseYear || ''}
                  onChange={(e) => handleNestedChange('details', 'releaseYear', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          {/* Section SEO */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">SEO</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-6">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre Meta
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="seo.metaTitle"
                  value={product.seo?.metaTitle || ''}
                  onChange={(e) => handleNestedChange('seo', 'metaTitle', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description Meta
                </label>
                <textarea
                  id="metaDescription"
                  name="seo.metaDescription"
                  rows={2}
                  value={product.seo?.metaDescription || ''}
                  onChange={(e) => handleNestedChange('seo', 'metaDescription', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                  Mots-clés (séparés par des virgules)
                </label>
                <input
                  type="text"
                  id="keywords"
                  name="seo.keywords"
                  value={product.seo?.keywords || ''}
                  onChange={(e) => handleNestedChange('seo', 'keywords', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm text-gray-900 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditProduct;
