// Service pour gérer les catégories
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoryAttributesDefinition {
  [key: string]: {
    name: string;
    values: string[];
    filterable: boolean;
  };
}

/**
 * Supprime une catégorie par son ID (DELETE)
 */
export const deleteCategory = async (id: string): Promise<{ success: boolean } | Category> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Erreur lors de la suppression de la catégorie: ${response.status} ${message}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur dans deleteCategory:', error);
    throw error;
  }
}

export interface CategorySEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface CreateCategoryPayload {
  name: string; // required
  slug: string; // required
  description?: string;
  image?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  parentId?: string | null;
  attributes?: CategoryAttributesDefinition;
  seo?: CategorySEO;
}

/**
 * Récupère la liste des catégories
 * @param page Numéro de page
 * @param limit Nombre d'éléments par page
 * @returns Promise avec la réponse contenant les catégories
 */
export const getCategories = async (page = 1, limit = 100): Promise<CategoriesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des catégories: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur dans getCategories:', error);
    throw error;
  }
};

/**
 * Crée une nouvelle catégorie
 * @param payload Données de la catégorie
 */
export const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Erreur lors de la création de la catégorie: ${response.status} ${message}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur dans createCategory:', error);
    throw error;
  }
};

/**
 * Récupère une catégorie par son ID
 * @param id ID de la catégorie
 * @returns Promise avec la catégorie
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la catégorie: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur dans getCategoryById:', error);
    throw error;
  }
};

/**
 * Met à jour partiellement une catégorie (PATCH)
 * Utilise API_BASE_URL pour pointer vers le backend configuré
 */
export const updateCategory = async (
  id: string,
  payload: Partial<CreateCategoryPayload>
): Promise<Category> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Erreur lors de la mise à jour de la catégorie: ${response.status} ${message}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur dans updateCategory:', error);
    throw error;
  }
};

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
