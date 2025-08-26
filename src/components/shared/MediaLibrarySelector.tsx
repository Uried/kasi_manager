import React, { useState, useEffect } from 'react';
import { getFiles, formatImageUrl } from '../../services/fileService';
import type { FileUploadResponse } from '../../services/fileService';

interface MediaLibrarySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedImages: string[]) => void;
  multiple?: boolean;
  currentSelectedImages?: string[];
}

const MediaLibrarySelector: React.FC<MediaLibrarySelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = true,
  currentSelectedImages = []
}) => {
  const [mediaItems, setMediaItems] = useState<FileUploadResponse[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>(currentSelectedImages);
  const [filters, setFilters] = useState({
    name: '',
    sortBy: 'Plus récents'
  });
  const [loading, setLoading] = useState(false);

  // Charger les médias depuis l'API
  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const files = await getFiles();
      setMediaItems(files);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error);
      setLoading(false);
    }
  };

  const handleSelectItem = (url: string) => {
    if (multiple) {
      // Mode sélection multiple
      if (selectedItems.includes(url)) {
        setSelectedItems(selectedItems.filter(item => item !== url));
      } else {
        setSelectedItems([...selectedItems, url]);
      }
    } else {
      // Mode sélection unique
      setSelectedItems([url]);
    }
  };

  const handleConfirmSelection = () => {
    onSelect(selectedItems);
    onClose();
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  // Filtrer les médias en fonction des critères
  const getFilteredMedia = () => {
    let filtered = [...mediaItems];
    
    // Filtrer par nom/customFilename
    if (filters.name) {
      const searchTerm = filters.name.toLowerCase();
      filtered = filtered.filter(item => 
        (item.customFilename && item.customFilename.toLowerCase().includes(searchTerm)) || 
        item.originalName.toLowerCase().includes(searchTerm)
      );
    }
    
    // Trier les résultats
    switch (filters.sortBy) {
      case 'Plus récents':
        filtered.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return 0;
        });
        break;
      case 'Plus anciens':
        filtered.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          return 0;
        });
        break;
      case 'Nom (A-Z)':
        filtered.sort((a, b) => {
          const nameA = (a.customFilename || a.originalName).toLowerCase();
          const nameB = (b.customFilename || b.originalName).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case 'Nom (Z-A)':
        filtered.sort((a, b) => {
          const nameA = (a.customFilename || a.originalName).toLowerCase();
          const nameB = (b.customFilename || b.originalName).toLowerCase();
          return nameB.localeCompare(nameA);
        });
        break;
      default:
        break;
    }
    
    return filtered;
  };

  // Récupérer les médias filtrés
  const filteredMediaItems = getFilteredMedia();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-0 relative z-50 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Sélectionner des images</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 border-b">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  className="w-full border border-gray-300 rounded-md pl-10 px-3 py-2 text-sm text-black"
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  placeholder="Rechercher par nom"
                />
              </div>
            </div>
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Trier par
              </label>
              <select
                id="sortBy"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black font-medium"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option>Plus récents</option>
                <option>Plus anciens</option>
                <option>Nom (A-Z)</option>
                <option>Nom (Z-A)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">{filteredMediaItems.length} médias trouvés</p>
            <p className="text-sm text-gray-500">{selectedItems.length} sélectionné(s)</p>
          </div>
        </div>

        {/* Media Grid */}
        <div className="overflow-y-auto flex-grow p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMediaItems.filter(item => item.mimeType.startsWith('image/')).map((item) => {
                const isSelected = selectedItems.includes(formatImageUrl(item.url));
                return (
                  <div
                    key={item._id}
                    className={`relative overflow-hidden cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : 'hover:opacity-90'}`}
                    style={{ borderRadius: '8px' }}
                    onClick={() => handleSelectItem(formatImageUrl(item.url))}
                  >
                    {/* Image container with fixed aspect ratio */}
                    <div className="relative pb-[100%]">
                      <img
                        src={formatImageUrl(item.url)}
                        alt={item.originalName}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback en cas d'erreur de chargement d'image
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Éviter les boucles infinies
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Checkbox in top-left corner */}
                    <div
                      className={`absolute top-0 left-0 w-8 h-8 flex items-center justify-center ${isSelected ? 'bg-blue-500' : 'bg-black bg-opacity-20'}`}
                      style={{ borderTopLeftRadius: '8px' }}
                    >
                      {isSelected && (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Nom personnalisé du fichier */}
                    <div className="mt-2 px-2 pb-2 text-center">
                      <p className="text-sm text-gray-800 truncate" title={item.customFilename || item.originalName}>
                        {item.customFilename || item.originalName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <div className="border-t p-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirmSelection}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={selectedItems.length === 0}
          >
            {multiple ? `Sélectionner (${selectedItems.length})` : 'Sélectionner'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrarySelector;
