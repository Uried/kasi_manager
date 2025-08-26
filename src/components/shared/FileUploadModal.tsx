import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { uploadFile } from '../../services/fileService';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

interface UploadFormData {
  file: File | null;
  category: string;
  customFilename: string;
  relatedId: string;
  description: string;
  isPublic: boolean;
}

const FileUploadModal = ({ isOpen, onClose, onUploadSuccess }: FileUploadModalProps) => {
  const [formData, setFormData] = useState<UploadFormData>({
    file: null,
    category: 'products',
    customFilename: '',
    relatedId: '',
    description: '',
    isPublic: true
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUploading(true);

    try {
      if (!formData.file) {
        throw new Error('Veuillez sélectionner un fichier');
      }

      // Utilisation du service de téléchargement de fichiers
      await uploadFile(
        formData.file,
        formData.customFilename || undefined,
        formData.isPublic
      );

      // Réinitialiser le formulaire
      setFormData({
        file: null,
        category: 'products',
        customFilename: '',
        relatedId: '',
        description: '',
        isPublic: true
      });

      // Notifier le composant parent
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Ajouter un fichier</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier à uploader*
            </label>
            <input
              type="file"
              name="file"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie du fichier*
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="products">Produits</option>
              <option value="clients">Clients</option>
              <option value="invoices">Factures</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom personnalisé du fichier
            </label>
            <input
              type="text"
              name="customFilename"
              value={formData.customFilename}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="ex: mon-produit"
            />
          </div>

          {/* <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de l'entité associée
            </label>
            <input
              type="text"
              name="relatedId"
              value={formData.relatedId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="ex: 60d21b4667d0d8992e..."
            />
          </div> */}

          {/* <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description du fichier
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              rows={3}
              placeholder="ex: Image de produit"
            />
          </div> */}

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Visibilité publique</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${isUploading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isUploading ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUploadModal;
