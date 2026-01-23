// src/services/fileService.ts

// Service pour gérer les téléchargements de fichiers

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.kasi.market/api';

const FILE_UPLOAD_URL =
  import.meta.env.VITE_FILE_UPLOAD_URL || `${API_BASE_URL}/file-management/upload`;

const FILE_SERVER_BASE_URL =
  import.meta.env.VITE_FILE_SERVER_BASE_URL || 'https://api.kasi.market';

export interface FileUploadResponse {
  _id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  category: string;
  isPublic: boolean;
  customFilename?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * Télécharge un fichier vers le serveur
 * @param file - Le fichier à télécharger
 * @param customFilename - Nom personnalisé du fichier (optionnel)
 * @param isPublic - Indique si le fichier est public (par défaut: true)
 * @returns Promise avec la réponse du serveur
 */
export const uploadFile = async (
  file: File,
  customFilename?: string,
  isPublic: boolean = true
): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    if (customFilename) {
      formData.append('customFilename', customFilename);
    }

    formData.append('isPublic', isPublic.toString());

    const response = await fetch(FILE_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      credentials: 'include', // si ton API utilise des cookies / sessions
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // Si la réponse n'est pas du JSON, retourner un objet par défaut
    return {
      _id: 'temp-id',
      originalName: file.name,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      path: '',
      url: URL.createObjectURL(file), // URL temporaire pour l'aperçu
      category: 'default',
      isPublic,
      customFilename,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    throw error;
  }
};

/**
 * Supprime un fichier
 * @param fileId - ID du fichier à supprimer
 */
export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/file-management/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Supprime plusieurs fichiers en parallèle
 * @param fileIds Tableau d'identifiants de fichiers à supprimer
 */
export const deleteMultipleFiles = async (fileIds: string[]): Promise<void> => {
  try {
    await Promise.all(fileIds.map((fileId) => deleteFile(fileId)));
    return;
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    throw error;
  }
};

/**
 * Récupère la liste des fichiers
 * @param category - Catégorie des fichiers (optionnel)
 */
export const getFiles = async (category?: string): Promise<FileUploadResponse[]> => {
  try {
    const url = category
      ? `${API_BASE_URL}/file-management?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/file-management`;

    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des fichiers: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    throw error;
  }
};

/**
 * Formate une URL d'image pour s'assurer qu'elle est absolue
 * @param url - L'URL à formater
 * @returns L'URL formatée
 */
export const formatImageUrl = (url: string): string => {
  if (!url) return '/placeholder.svg';

  // URL déjà absolue
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // URL relative commençant par /
  if (url.startsWith('/')) {
    return `${FILE_SERVER_BASE_URL}${url}`;
  }

  // Autres cas : relative sans /
  return `${FILE_SERVER_BASE_URL}/${url}`;
};

export default {
  uploadFile,
  deleteFile,
  deleteMultipleFiles,
  getFiles,
  formatImageUrl,
};
