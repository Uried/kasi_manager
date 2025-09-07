// Service pour gérer les produits
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.kasi.market/api';

export interface ProductDetails {
  brand?: string;
  gender?: string;
  size?: string;
  madeIn?: string;
  releaseYear?: number;
}

export interface ProductSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface FragranceNotes {
  top?: string[];
  middle?: string[];
  base?: string[];
}

export interface Fragrance {
  type?: string;
  notes?: FragranceNotes;
  concentration?: string;
  sillage?: string;
  longevity?: string;
}

export interface Category {
  name: string;
  description: string;
  slug: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface Product {
  id?: string;
  _id?: string; // Pour la compatibilité avec MongoDB
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categories: string[] | Category[]; // Permet d'utiliser soit des IDs de catégories, soit des objets catégories
  
  discountPrice?: number;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  status?: 'available' | 'out_of_stock' | 'coming_soon';
  
  details?: ProductDetails;
  seo?: ProductSeo;
  fragrance?: Fragrance;
  
  viewCount?: number;
  likeCount?: number;
  purchaseCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Crée un nouveau produit
 * @param product - Les données du produit à créer
 * @returns Promise avec le produit créé
 */
export const createProduct = async (product: Product): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Erreur lors de la création du produit: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    throw error;
  }
};

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Récupère la liste des produits
 * @param page - Numéro de page (optionnel, par défaut 1)
 * @param limit - Nombre d'éléments par page (optionnel, par défaut 10)
 * @returns Promise avec la réponse contenant les produits et les informations de pagination
 */
export const getProducts = async (page: number = 1, limit: number = 10): Promise<ProductsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des produits: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    throw error;
  }
};

/**
 * Récupère un produit par son ID
 * @param id - ID du produit
 * @returns Promise avec le produit
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du produit: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération du produit ${id}:`, error);
    throw error;
  }
};

/**
 * Met à jour un produit existant
 * @param id - ID du produit à mettre à jour
 * @param product - Nouvelles données du produit
 * @returns Promise avec le produit mis à jour
 */
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour du produit: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du produit ${id}:`, error);
    throw error;
  }
};

/**
 * Supprime un produit
 * @param id - ID du produit à supprimer
 * @returns Promise résolue si la suppression est réussie
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression du produit: ${response.status}`);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du produit ${id}:`, error);
    throw error;
  }
};

/**
 * Met à jour partiellement un produit (par exemple, uniquement le stock)
 * @param id - ID du produit à mettre à jour
 * @param partialProduct - Données partielles du produit à mettre à jour
 * @returns Promise avec le produit mis à jour
 */
export const updateProductInventory = async (id: string, partialProduct: Partial<Product>): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partialProduct),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour de l'inventaire: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'inventaire du produit ${id}:`, error);
    throw error;
  }
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductInventory,
  deleteProduct,
};
