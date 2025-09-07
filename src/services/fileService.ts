// Service pour gérer les téléchargements de fichiers
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.kasi.market/api';
const FILE_UPLOAD_URL = import.meta.env.VITE_FILE_UPLOAD_URL || `${API_BASE_URL}/file-management/upload`;
const FILE_SERVER_BASE_URL = import.meta.env.VITE_FILE_SERVER_BASE_URL || 'http://146.59.155.128:8000';

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
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement: ${response.status}`);
    }
    
    // Vérifier si la réponse contient du contenu avant de parser le JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
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
        isPublic: isPublic,
        customFilename: customFilename,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    throw error;
  }
};

/**
 * Supprime un fichier
 * @param fileId - ID du fichier à supprimer
 * @returns - Promesse résolue si la suppression est réussie
 */
export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/file-management/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Pas besoin de parser la réponse si c'est juste un statut de succès
    return;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Supprime plusieurs fichiers en parallèle
 * @param fileIds Tableau d'identifiants de fichiers à supprimer
 * @returns Promise qui se résout lorsque toutes les suppressions sont terminées
 */
export const deleteMultipleFiles = async (fileIds: string[]): Promise<void> => {
  try {
    // Utilisation de Promise.all pour exécuter toutes les requêtes en parallèle
    await Promise.all(fileIds.map(fileId => deleteFile(fileId)));
    return;
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    throw error;
  }
};

/**
 * Récupère la liste des fichiers
 * @param category - Catégorie des fichiers (optionnel)
 * @returns Promise avec la liste des fichiers
 */
export const getFiles = async (category?: string): Promise<FileUploadResponse[]> => {
  try {
    const url = category 
      ? `${API_BASE_URL}/file-management?category=${category}` 
      : `${API_BASE_URL}/file-management`;
    
    const response = await fetch(url);

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
  // Chemin vers l'image placeholder dans le dossier public
  if (!url) return '/placeholder.svg';
  
  // Si l'URL est déjà absolue (commence par http:// ou https://), la retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si l'URL est relative (commence par /), utiliser le serveur de fichiers
  if (url.startsWith('/')) {
    return `${FILE_SERVER_BASE_URL}${url}`;
  }
  
  // Dans les autres cas, considérer que c'est une URL relative au serveur de fichiers
  return `${FILE_SERVER_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default {
  uploadFile,
  deleteFile,
  getFiles,
  formatImageUrl,
};
