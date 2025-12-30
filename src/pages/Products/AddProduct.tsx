import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePalette } from 'color-thief-react';
import type { Category } from '../../services/categoryService';
import { getCategories } from '../../services/categoryService';
import { createProduct } from '../../services/productService';
import MediaLibrarySelector from '../../components/shared/MediaLibrarySelector';

// Composant pour afficher une carte de catégorie avec coloration basée sur l'image
interface CategoryCardProps {
    category: Category;
    isSelected: boolean;
    onSelect: () => void;
}

const CategoryCard = ({ category, isSelected, onSelect }: CategoryCardProps) => {
    // Utiliser usePalette pour extraire la couleur prédominante de l'image
    const { data: paletteData } = usePalette(category.image || '', 1, 'hex', {
        crossOrigin: 'anonymous',
        quality: 10
    });

    // Déterminer le style de la carte en fonction de la couleur extraite
    const cardStyle = {
        backgroundColor: isSelected ? undefined : (paletteData && category.image) ? `${paletteData[0]}20` : undefined, // 20 = 12.5% opacity en hexadécimal
        borderColor: isSelected ? undefined : (paletteData && category.image) ? `${paletteData[0]}80` : undefined // 80 = 50% opacity en hexadécimal
    };

    return (
        <div 
            onClick={onSelect}
            className={`cursor-pointer rounded-lg border p-3 transition-all ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-300 hover:border-gray-400'}`}
            style={cardStyle}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-md flex items-center justify-center mr-3 overflow-hidden">
                        {category.image ? (
                            <img 
                                src={category.image} 
                                alt={category.name} 
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/placeholder.svg';
                                }}
                            />
                        ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <span className="font-medium text-gray-800">{category.name}</span>
                </div>
                <div className="flex-shrink-0">
                    <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                </div>
            </div>
        </div>
    );
};

// Types pour notre formulaire
interface ProductData {
    // Champs obligatoires
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    categories: string[];

    // Champs optionnels
    discountPrice?: number;
    rating?: number;
    reviewCount?: number;
    isFeatured?: boolean;
    isNew?: boolean;
    isTrending?: boolean;
    status?: 'available' | 'out_of_stock' | 'coming_soon';

    // Details (optionnel)
    details?: {
        brand?: string;
        gender?: string;
        size?: string;
        madeIn?: string;
        releaseYear?: number;
    };

    // SEO (optionnel)
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
    };
}

const AddProduct = () => {
    const navigate = useNavigate();
    // Nous n'avons plus besoin de cette référence car nous n'utilisons plus l'input file
    // const fileInputRef = useRef<HTMLInputElement>(null);

    // État pour l'upload d'images
    // Nous n'utilisons plus les fichiers d'images directement, uniquement les URLs
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

    // État pour le sélecteur de médiathèque
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

    // État pour les catégories
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    
    // État pour les erreurs de validation
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // États pour stocker les données du formulaire
    const [productData, setProductData] = useState<ProductData>({
        // Champs obligatoires
        name: '',
        description: '',
        price: 0,
        stock: 0,
        images: [],
        categories: [],

        // Champs optionnels
        discountPrice: 0,
        rating: 0,
        reviewCount: 0,
        isFeatured: false,
        isNew: false,
        isTrending: false,
        status: 'available',

        // Details
        details: {
            brand: '',
            gender: '',
            size: '',
            madeIn: '',
            releaseYear: new Date().getFullYear(),
        },

        // SEO
        seo: {
            metaTitle: '',
            metaDescription: '',
            keywords: [],
        },
    });

    // Gestion des changements dans le formulaire
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProductData({
            ...productData,
            [name]: value,
        });
    };

    // Gestion des changements pour les champs boolean
    const handleBooleanChange = (name: string, value: boolean) => {
        setProductData({
            ...productData,
            [name]: value,
        });
    };

    // Gestion des changements pour les catégories
    const handleCategoryChange = (categoryId: string) => {
        console.log('Clic sur catégorie:', categoryId);
        console.log('Catégories actuelles:', productData.categories);
        
        setProductData(prev => {
            const isAlreadySelected = prev.categories.includes(categoryId);
            const updatedCategories = isAlreadySelected
                ? prev.categories.filter(id => id !== categoryId)
                : [...prev.categories, categoryId];
            
            console.log('Nouvelles catégories:', updatedCategories);
            return {
                ...prev,
                categories: updatedCategories,
            };
        });
    };

    // Gestion des changements dans les objets imbriqués
    const handleNestedChange = (key: keyof ProductData, nestedKey: string, value: any) => {
        // Pour les objets imbriqués (details, seo)
        setProductData(prev => {
            const updatedData = { ...prev };
            if (typeof updatedData[key] === 'object' && updatedData[key] !== null) {
                (updatedData[key] as any)[nestedKey] = value;
            }
            return updatedData;
        });
    };

    // Fonction pour gérer les champs de notation
    const handleRatingChange = (value: number) => {
        setProductData(prev => ({
            ...prev,
            rating: value
        }));
    };


    // Gestion des changements pour les mots-clés SEO
    const handleKeywordsChange = (value: string) => {
        setProductData(prev => ({
            ...prev,
            seo: {
                ...prev.seo,
                keywords: value.split(',').map((keyword: string) => keyword.trim()),
            },
        }));
    };

    // Cette fonction n'est plus utilisée car nous utilisons uniquement la médiathèque
    // Conservée pour référence
    /*
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        
        // Mettre à jour les fichiers d'images
        setImageFiles(prevFiles => [...prevFiles, ...filesArray]);
        
        // Générer des URLs pour l'aperçu
        const newImageUrls = filesArray.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(prevUrls => [...prevUrls, ...newImageUrls]);
      }
    };
    */

    // Gérer la sélection d'images depuis la médiathèque
    const handleMediaLibrarySelect = (selectedImages: string[]) => {
        // Ajouter uniquement les nouvelles images qui ne sont pas déjà dans la liste
        const newImages = selectedImages.filter(url => !imagePreviewUrls.includes(url));

        if (newImages.length > 0) {
            setImagePreviewUrls(prevUrls => [...prevUrls, ...newImages]);

            // Mettre à jour productData.images avec les URLs des images sélectionnées
            setProductData(prevData => ({
                ...prevData,
                images: [...prevData.images, ...newImages]
            }));
        }
    };

    // Supprimer une image
    const removeImage = (index: number) => {
        // Mettre à jour l'état des URLs d'images
        setImagePreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));

        // Mettre à jour productData.images également
        setProductData(prevData => ({
            ...prevData,
            images: prevData.images.filter((_, i) => i !== index)
        }));
    };

    // Validation du formulaire
    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Validation des champs obligatoires
        if (!productData.name.trim()) {
            errors.name = 'Le nom du produit est obligatoire';
        }

        if (!productData.description.trim()) {
            errors.description = 'La description est obligatoire';
        }

        if (productData.price <= 0) {
            errors.price = 'Le prix doit être supérieur à 0';
        }

        if (productData.stock < 0) {
            errors.stock = 'Le stock ne peut pas être négatif';
        }

        if (imagePreviewUrls.length === 0) {
            errors.images = 'Au moins une image est requise';
        }

        if (productData.categories.length === 0) {
            errors.categories = 'Sélectionnez au moins une catégorie';
        }

        return errors;
    };

    // Chargement des catégories depuis l'API
    useEffect(() => {
        const loadCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const response = await getCategories();
                console.log('Catégories chargées:', response.categories.map(c => ({ _id: c._id, name: c.name })));
                setCategories(response.categories);
            } catch (error) {
                console.error('Erreur lors du chargement des catégories:', error);
                // Optionnel: afficher un message d'erreur à l'utilisateur
            } finally {
                setIsLoadingCategories(false);
            }
        };
        
        loadCategories();
    }, []);
    
    // Effet pour réinitialiser les erreurs lors de la modification des champs
    useEffect(() => {
        if (Object.keys(formErrors).length > 0) {
            setFormErrors({});
        }
    }, [productData]);

    // Soumission du formulaire
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Valider le formulaire
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            // Faire défiler jusqu'à la première erreur
            const firstErrorId = Object.keys(errors)[0];
            const errorElement = document.getElementById(`${firstErrorId}-error`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            // Les images sont déjà sélectionnées depuis la médiathèque
            // et stockées dans productData.images

            // Envoyer les données au serveur via notre service
            const createdProduct = await createProduct(productData);
            console.log('Produit créé avec succès:', createdProduct);

            // Afficher un message de succès (vous pourriez ajouter un système de notification ici)
            alert('Produit ajouté avec succès !');

            // Rediriger vers la liste des produits après succès
            navigate('/products');
        } catch (error: any) {
            console.error('Erreur lors de l\'ajout du produit:', error);
            setFormErrors({ 
                submit: error.message || 'Une erreur est survenue lors de l\'ajout du produit. Veuillez réessayer.' 
            });
            
            // Faire défiler jusqu'au message d'erreur
            const errorElement = document.getElementById('submit-error');
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Sélecteur de médiathèque */}
            <MediaLibrarySelector
                isOpen={isMediaLibraryOpen}
                onClose={() => setIsMediaLibraryOpen(false)}
                onSelect={handleMediaLibrarySelect}
                multiple={true}
                currentSelectedImages={imagePreviewUrls}
            />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-900">Ajouter un nouveau produit</h1>
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Traitement...
                            </>
                        ) : 'Enregistrer'}
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Section d'informations générales */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Informations du produit</h2>
                        <div className="ml-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires.</p>

                    {/* Informations principales - style similaire à l'image */}
                    <div className="grid grid-cols-1 gap-y-6 gap-x-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
                                Nom du produit <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={productData.name}
                                onChange={handleChange}
                                className={`shadow-sm focus:ring-blue-500 text-center font-bold focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md text-black`}
                                required
                                aria-invalid={formErrors.name ? 'true' : 'false'}
                                aria-describedby={formErrors.name ? 'name-error' : undefined}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-600" id="name-error">{formErrors.name}</p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Catégories <span className="text-red-500">*</span>
                            </label>
                            
                            {isLoadingCategories ? (
                                <div className="flex items-center justify-center p-4 border border-gray-300 rounded-md">
                                    <svg className="animate-spin h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Chargement des catégories...</span>
                                </div>
                            ) : categories.length > 0 ? (
                                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${formErrors.categories ? 'border border-red-500 rounded-md p-2' : ''}`}>
                                    {categories.map((category) => {
                                        const isSelected = productData.categories.includes(category._id);
                                        return (
                                            <CategoryCard 
                                                key={category._id}
                                                category={category}
                                                isSelected={isSelected}
                                                onSelect={() => handleCategoryChange(category._id)}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center p-4 border border-gray-300 rounded-md">
                                    <p className="text-gray-500">Aucune catégorie disponible</p>
                                </div>
                            )}
                            
                            {formErrors.categories && (
                                <p className="mt-1 text-sm text-red-600" id="categories-error">{formErrors.categories}</p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                value={productData.description}
                                onChange={handleChange}
                                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md text-black`}
                                aria-invalid={formErrors.description ? 'true' : 'false'}
                                aria-describedby={formErrors.description ? 'description-error' : undefined}
                            />
                            {formErrors.description && (
                                <p className="mt-1 text-sm text-red-600" id="description-error">{formErrors.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section de prix et stock */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Prix et stock</h2>
                        <div className="ml-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                    </div>
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
                                value={productData.price}
                                onChange={handleChange}
                                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md text-black`}
                                required
                                aria-invalid={formErrors.price ? 'true' : 'false'}
                                aria-describedby={formErrors.price ? 'price-error' : undefined}
                            />
                            {formErrors.price && (
                                <p className="mt-1 text-sm text-red-600" id="price-error">{formErrors.price}</p>
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
                                value={productData.discountPrice}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
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
                                value={productData.stock}
                                onChange={handleChange}
                                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black block w-full px-3 py-2 sm:text-sm border ${formErrors.stock ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                aria-invalid={formErrors.stock ? 'true' : 'false'}
                                aria-describedby={formErrors.stock ? 'stock-error' : undefined}
                            />
                            {formErrors.stock && (
                                <p className="mt-1 text-sm text-red-600" id="stock-error">{formErrors.stock}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Statut
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={productData.status || 'available'}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
                            >
                                <option value="available">Disponible</option>
                                <option value="out_of_stock">Rupture de stock</option>
                                <option value="coming_soon">Bientôt disponible</option>
                                <option value="discontinued">Discontinué</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section pour les champs de notation */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Notation et popularité</h2>
                        <div className="ml-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                                Note du produit (0-5)
                            </label>
                            <input
                                type="number"
                                id="rating"
                                name="rating"
                                min="0"
                                max="5"
                                step="0.1"
                                value={productData.rating}
                                onChange={(e) => handleRatingChange(parseFloat(e.target.value))}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
                            />
                        </div>

                        <div>
                            <label htmlFor="reviewCount" className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre d'avis
                            </label>
                            <input
                                type="number"
                                id="reviewCount"
                                name="reviewCount"
                                min="0"
                                value={productData.reviewCount}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
                            />
                        </div>
                    </div>
                </div>

                {/* Section des détails du produit */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Détails du produit</h2>
                        <div className="ml-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                                Marque
                            </label>
                            <input
                                type="text"
                                name="details.brand"
                                id="brand"
                                value={productData.details?.brand || ''}
                                onChange={(e) => handleNestedChange('details', 'brand', e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
                            />
                        </div>

                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                Genre
                            </label>
                            <select
                                id="gender"
                                name="details.gender"
                                value={productData.details?.gender || ''}
                                onChange={(e) => handleNestedChange('details', 'gender', e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
                            >
                                <option value="">Sélectionnez</option>
                                <option value="homme">Homme</option>
                                <option value="femme">Femme</option>
                                <option value="unisexe">Unisexe</option>
                                <option value="enfant">Enfant</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                                Taille
                            </label>
                            <input
                                type="text"
                                name="details.size"
                                id="size"
                                value={productData.details?.size || ''}
                                onChange={(e) => handleNestedChange('details', 'size', e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
                            />
                        </div>

                        <div>
                            <label htmlFor="madeIn" className="block text-sm font-medium text-gray-700 mb-1">
                                Fabriqué en
                            </label>
                            <input
                                type="text"
                                name="details.madeIn"
                                id="madeIn"
                                value={productData.details?.madeIn || ''}
                                onChange={(e) => handleNestedChange('details', 'madeIn', e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
                            />
                        </div>

                        <div>
                            <label htmlFor="releaseYear" className="block text-sm font-medium text-gray-700 mb-1">
                                Année de sortie
                            </label>
                            <input
                                type="number"
                                name="details.releaseYear"
                                id="releaseYear"
                                min="1900"
                                max={new Date().getFullYear()}
                                value={productData.details?.releaseYear || new Date().getFullYear()}
                                onChange={(e) => handleNestedChange('details', 'releaseYear', parseInt(e.target.value))}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
                            />
                        </div>
                    </div>
                </div>

                {/* Section des options de visibilité */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Options de visibilité</h2>
                        <div className="ml-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-3">
                        <div>
                            <div className="flex items-center">
                                <input
                                    id="isFeatured"
                                    name="isFeatured"
                                    type="checkbox"
                                    checked={productData.isFeatured || false}
                                    onChange={(e) => handleBooleanChange('isFeatured', e.target.checked)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isFeatured" className="ml-3 block text-sm font-medium text-gray-700">
                                    Produit mis en avant
                                </label>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center">
                                <input
                                    id="isNew"
                                    name="isNew"
                                    type="checkbox"
                                    checked={productData.isNew || false}
                                    onChange={(e) => handleBooleanChange('isNew', e.target.checked)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isNew" className="ml-3 block text-sm font-medium text-gray-700">
                                    Nouveau produit
                                </label>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center">
                                <input
                                    id="isTrending"
                                    name="isTrending"
                                    type="checkbox"
                                    checked={productData.isTrending || false}
                                    onChange={(e) => handleBooleanChange('isTrending', e.target.checked)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isTrending" className="ml-3 block text-sm font-medium text-gray-700">
                                    Produit tendance
                                </label>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Section d'images */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Images du produit <span className="text-red-500">*</span></h2>
                        <div className="ml-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className={`mt-1 flex flex-col justify-center px-6 pt-5 pb-6 border-2 ${formErrors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} border-dashed rounded-md`}>
                        <div className="space-y-4 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>

                            <p className="text-sm text-gray-600">Sélectionnez des images depuis la médiathèque</p>

                            {/* Bouton pour ouvrir la médiathèque */}
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setIsMediaLibraryOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Ouvrir la médiathèque
                                </button>
                            </div>
                            {formErrors.images && (
                                <p className="text-sm text-red-600" id="images-error">{formErrors.images}</p>
                            )}
                        </div>
                    </div>

                    {/* Aperçu des images */}
                    {imagePreviewUrls.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Images sélectionnées</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {imagePreviewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <div className="h-28 w-28 rounded-md border border-gray-200 overflow-hidden">
                                            <img
                                                src={url}
                                                alt={`Aperçu ${index + 1}`}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder.svg';
                                                }}
                                            />
                                        </div>
                                        <div
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-14 bg-black hover:cursor-pointer text-white rounded-full shadow-sm border border-gray-300 z-10"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"/></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Section SEO */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">SEO</h2>
                        <div className="ml-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-6">
                        <div>
                            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                Titre Meta
                            </label>
                            <input
                                type="text"
                                id="metaTitle"
                                name="metaTitle"
                                value={productData?.seo?.metaTitle || ''}
                                onChange={(e) => handleNestedChange('seo', 'metaTitle', e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
                            />
                        </div>

                        <div>
                            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Description Meta
                            </label>
                            <textarea
                                id="metaDescription"
                                name="metaDescription"
                                rows={3}
                                value={productData?.seo?.metaDescription || ''}
                                onChange={(e) => handleNestedChange('seo', 'metaDescription', e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
                            />
                        </div>

                        <div>
                            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                                Mots-clés (séparés par des virgules)
                            </label>
                            <input
                                type="text"
                                id="keywords"
                                name="keywords"
                                value={productData?.seo?.keywords?.join(', ') || ''}
                                onChange={(e) => handleKeywordsChange(e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md text-black"
                            />
                        </div>
                    </div>
                </div>

                {/* Bouton de soumission */}
                {formErrors.submit && (
                    <div className="rounded-md bg-red-50 p-4 mt-6" id="submit-error">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Erreur lors de l'ajout du produit</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{formErrors.submit}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end mt-8">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => navigate(-1)}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><defs><mask id="SVG62ezZdxw"><g fill="none" stroke-linejoin="round" stroke-width="4"><path fill="#fff" stroke="#fff" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke="#000" stroke-linecap="round" d="M24 16v16m-8-8h16"/></g></mask></defs><path fill="#000" d="M0 0h48v48H0z" mask="url(#SVG62ezZdxw)"/></svg>
                    
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Traitement en cours...
                            </>
                        ) : 'Ajouter le produit'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AddProduct;
