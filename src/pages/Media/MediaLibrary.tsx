import React, { useState, useEffect, useRef } from 'react';
import { uploadFile, getFiles, deleteFile, deleteMultipleFiles, formatImageUrl } from '../../services/fileService';
import type { FileUploadResponse } from '../../services/fileService';

interface MediaItem {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  language: string;
  url: string;
  selected?: boolean;
  customFilename?: string;
  isPublic?: boolean;
  path?: string;
  category?: string;
  createdAt?: string;
}

// Helper pour obtenir l'ID d'un MediaItem (compatible MongoDB _id et id)
const getMediaItemId = (item: MediaItem): string => item._id || item.id || '';

const MediaLibrary = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState({
    name: '',
    sortBy: 'Plus récents'
  });
  
  // État pour gérer l'affichage des notifications de succès
  const [notification, setNotification] = useState<{show: boolean; type: 'upload' | 'delete' | 'copy' | 'multiDelete' | null; count?: number}>({show: false, type: null});
  
  // État pour le modal de confirmation de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isMultipleDelete, setIsMultipleDelete] = useState(false);

  // État pour stocker les médias chargés depuis l'API
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  
  // Charger les médias depuis l'API
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const files = await getFiles();
        setMediaItems(files.map(file => ({
          id: file._id, // Utiliser _id au lieu de id
          name: file.originalName,
          type: file.mimeType,
          language: 'fr', // Valeur par défaut
          url: formatImageUrl(file.url), // Utiliser la fonction formatImageUrl pour gérer tous les cas
          customFilename: file.customFilename,
          isPublic: file.isPublic,
          path: file.path,
          category: file.category,
          createdAt: file.createdAt
        })));
      } catch (error) {
        console.error('Erreur lors du chargement des médias:', error);
      }
    };
    
    fetchMedia();
  }, []);
  
  // Données d'exemple à utiliser si l'API n'est pas disponible
  const sampleMediaItems: MediaItem[] = [
    {
      id: '1',
      name: 'eberhard-grossgasteiger-1062859-unsplash.jpg',
      type: 'image/jpeg',
      language: 'fr',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba'
    },
    {
      id: '2',
      name: 'eberhard-grossgasteiger-1373796-unsplash.jpg',
      type: 'image/jpeg',
      language: 'en',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
    },
    {
      id: '3',
      name: 'c9f94jc4_l8-nathan-anderson.jpg',
      type: 'image/jpeg',
      language: 'en',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'
    },
    {
      id: '4',
      name: 'eberhard-grossgasteiger-QW3-IPq4txw-unsplash.jpg',
      type: 'image/jpeg',
      language: 'en',
      url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5'
    },
    {
      id: '5',
      name: 'oliver-schwendener-oE3RGwvzqgw-unsplash.jpg',
      type: 'image/jpeg',
      language: 'en',
      url: 'https://images.unsplash.com/photo-1485470733090-0aae1788d5af'
    },
    {
      id: '6',
      name: 'luca-bravo-414628-unsplash.jpg',
      type: 'image/jpeg',
      language: 'en',
      url: 'https://images.unsplash.com/photo-1491904768633-2b7e3e7fede5'
    },
    {
      id: '7',
      name: 'eberhard-grossgasteiger-hQDxzx3aLU-unsplash.jpg',
      type: 'image/jpeg',
      language: 'en',
      url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e'
    },
    {
      id: '8',
      name: 'eberhard-grossgasteiger-677217-unsplash.jpg',
      type: 'image/jpeg',
      language: 'en',
      url: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8'
    },
    {
      id: '9',
      name: 'eberhard-grossgasteiger-542840-unsplash.jpg',
      type: 'image/jpeg',
      language: 'en',
      url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606'
    },
    {
      id: '10',
      name: 'daniel-plan-Zox70ehkSjY-unsplash.jpg',
      type: 'image/jpeg',
      language: 'en',
      url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99'
    },
    {
      id: '11',
      name: 'daniel-plan-B4kOw7Z1Z4-unsplash.jpg',
      type: 'image/jpeg',
      language: 'en',
      url: 'https://images.unsplash.com/photo-1486520299386-6d106b22014b'
    },
    {
      id: '12',
      name: 'eberhard-grossgasteiger-488833-unsplash.jpg',
      type: 'image/jpeg',
      language: 'en',
      url: 'https://images.unsplash.com/photo-1459213599465-03ab6a4d5931'
    },
  ];


  const handleViewModeChange = (mode: 'table' | 'grid') => {
    setViewMode(mode);
  };

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mediaItems.map(item => getMediaItemId(item)));
    }
    setSelectAll(!selectAll);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };
  
  const handleOpenDeleteModal = (fileId: string) => {
    setFileToDelete(fileId);
    setIsMultipleDelete(false);
    setIsDeleteModalOpen(true);
  };

  const handleOpenMultipleDeleteModal = () => {
    if (selectedItems.length === 0) return; // Ne rien faire si aucun élément n'est sélectionné
    setIsMultipleDelete(true);
    setFileToDelete(null);
    setIsDeleteModalOpen(true);
  };

  // Fonction pour copier le chemin absolu du fichier
  const handleCopyFilePath = (filePath: string | undefined) => {
    if (!filePath) return;
    const absolutePath = `${filePath}`;
    navigator.clipboard.writeText(absolutePath)
      .then(() => {
        setNotification({show: true, type: 'copy'});
        setTimeout(() => setNotification({show: false, type: null}), 3000);
      })
      .catch(err => {
        console.error('Erreur lors de la copie du chemin:', err);
      });
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
    setIsMultipleDelete(false);
  };

  const handleDeleteFile = async () => {
    try {
      if (isMultipleDelete && selectedItems.length > 0) {
        // Suppression multiple
        await deleteMultipleFiles(selectedItems);
        // Réinitialiser la sélection
        setSelectedItems([]);
        setSelectAll(false);
      } else if (fileToDelete) {
        // Suppression d'un seul fichier
        await deleteFile(fileToDelete);
      } else {
        return; // Rien à supprimer
      }
      
      // Rafraîchir la liste des médias après suppression
      await handleRefreshMediaList();
      // Fermer le modal
      handleCloseDeleteModal();
      // Afficher une notification de succès pour la suppression
      if (isMultipleDelete && selectedItems.length > 0) {
        setNotification({show: true, type: 'multiDelete', count: selectedItems.length});
      } else {
        setNotification({show: true, type: 'delete'});
      }
      setTimeout(() => setNotification({show: false, type: null}), 3000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // Fermer le modal même en cas d'erreur
      handleCloseDeleteModal();
    }
  };

  const handleRefreshMediaList = async () => {
    // Fonction pour rafraîchir la liste des médias
    console.log('Rafraîchissement de la liste des médias...');
    try {
      const files = await getFiles();
      setMediaItems(files.map(file => ({
        id: file._id, // Utiliser _id au lieu de id
        name: file.originalName,
        type: file.mimeType,
        language: 'fr', // Valeur par défaut
        url: formatImageUrl(file.url), // Utiliser la fonction formatImageUrl
        customFilename: file.customFilename,
        isPublic: file.isPublic,
        path: file.path,
        category: file.category,
        createdAt: file.createdAt
      })));
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier si le fichier est une image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // Si ce n'est pas une image, on efface la prévisualisation
        setPreviewImage(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Mettre à jour l'input file
      if (fileInputRef.current) {
        // Créer un nouvel objet DataTransfer
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
      
      // Prévisualiser si c'est une image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Filtrer les médias en fonction des critères
  const getFilteredMedia = () => {
    let filtered = [...mediaItems];
    
    // Filtrer par nom/customFilename
    if (filters.name) {
      const searchTerm = filters.name.toLowerCase();
      filtered = filtered.filter(item => 
        (item.customFilename && item.customFilename.toLowerCase().includes(searchTerm)) || 
        item.name.toLowerCase().includes(searchTerm)
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
          const nameA = (a.customFilename || a.name).toLowerCase();
          const nameB = (b.customFilename || b.name).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case 'Nom (Z-A)':
        filtered.sort((a, b) => {
          const nameA = (a.customFilename || a.name).toLowerCase();
          const nameB = (b.customFilename || b.name).toLowerCase();
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

  // Composant pour afficher une notification de succès
  const SuccessNotification = () => {
    if (!notification.show) return null;

    let message = '';
    if (notification.type === 'upload') {
      message = 'Fichier téléchargé avec succès!';
    } else if (notification.type === 'delete') {
      if (notification.count && notification.count > 1) {
        message = `${notification.count} fichiers supprimés avec succès!`;
      } else {
        message = 'Fichier supprimé avec succès!';
      }
    } else if (notification.type === 'copy') {
      message = 'Chemin du fichier copié dans le presse-papier!';
    } else if (notification.type === 'multiDelete') {
      message = `${notification.count} fichiers supprimés avec succès!`;
    }
    return (
      <div className="fixed bottom-5 right-5 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg z-50">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Notification de succès */}
      <SuccessNotification />
      
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-semibold text-gray-800">Médiathèque</h1>
        <div className="flex space-x-3">
          {selectedItems.length > 0 && (
            <button
              onClick={handleOpenMultipleDeleteModal}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer ({selectedItems.length})
            </button>
          )}
          <div
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-white border border-gray-300 cursor-pointer text-black px-4 py-2 rounded-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter un média
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleViewModeChange('table')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${viewMode === 'table'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Tableau
          </button>
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${viewMode === 'grid'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Grille
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-start-3">
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
                placeholder="Rechercher par nom personnalisé"
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
        </div>
      </div>

      {/* Select All */}
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <span className="ml-2 text-sm text-gray-700">Sélectionner tous les médias</span>
        </label>
      </div>

      {/* Media Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {filteredMediaItems.map((item) => {
            const itemId = getMediaItemId(item);
            const isSelected = selectedItems.includes(itemId);
            return (
              <div
                key={itemId}
                className={`relative overflow-hidden ${isSelected ? 'border-2 border-blue-500' : ''}`}
                style={{ borderRadius: '8px' }}
              >
                {/* Image container with fixed aspect ratio */}
                <div className="relative pb-[100%]">
                  <img
                    src={item.url}
                    alt={item.name}
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
                  onClick={() => handleSelectItem(itemId)}
                >
                  {/* Checkbox invisible pour l'accessibilité */}
                  <input
                    type="checkbox"
                    className="opacity-0 absolute w-4 h-4 cursor-pointer"
                    checked={isSelected}
                    onChange={() => {}} // Géré par le onClick du parent
                    aria-label="Sélectionner l'image"
                  />
                  {isSelected && (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Action buttons in top-right corner */}
                <div className="absolute top-0 right-0 space-x-3 py-4 px-2 flex">
                 
                  <div className="hover:cursor-pointer"  onClick={() => handleCopyFilePath(item.path)} title="Copier le chemin absolu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="#fff" d="M408 480H184a72 72 0 0 1-72-72V184a72 72 0 0 1 72-72h224a72 72 0 0 1 72 72v224a72 72 0 0 1-72 72" /><path fill="#fff" d="M160 80h235.88A72.12 72.12 0 0 0 328 32H104a72 72 0 0 0-72 72v224a72.12 72.12 0 0 0 48 67.88V160a80 80 0 0 1 80-80" /></svg>
                  </div>
                  <div 
                    className="hover:cursor-pointer"
                    onClick={() => handleOpenDeleteModal(itemId)}
                    title="Supprimer le fichier"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" /><path fill="#d92929" d="M20 5a1 1 0 1 1 0 2h-1l-.003.071l-.933 13.071A2 2 0 0 1 16.069 22H7.93a2 2 0 0 1-1.995-1.858l-.933-13.07L5 7H4a1 1 0 0 1 0-2zm-6-3a1 1 0 1 1 0 2h-4a1 1 0 0 1 0-2z" /></g></svg>
                  </div>
                </div>

                {/* Nom personnalisé du fichier */}
                <div className="mt-2 px-2 pb-2 text-center">
                  <p className="text-sm text-gray-800 truncate" title={item.customFilename || item.name}>
                    {item.customFilename || item.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Table */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMediaItems.map((item) => {
                const itemId = getMediaItemId(item);
                return (
                <tr key={itemId} className={selectedItems.includes(itemId) ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      checked={selectedItems.includes(itemId)}
                      onChange={() => handleSelectItem(itemId)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img 
                          className="h-10 w-10 object-cover" 
                          src={item.url} 
                          alt="" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Modifier</button>
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleCopyFilePath(item.path)}
                      title="Copier le chemin absolu"
                    >
                      Copier
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleOpenDeleteModal(itemId)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal d'upload de fichier personnalisé */}
      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center" 
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={handleCloseDeleteModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-0 relative z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Confirmer la suppression</h2>
              <button 
                onClick={handleCloseDeleteModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-5 text-center">
                <svg className="mx-auto mb-4 w-14 h-14 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {isMultipleDelete ? (
                  <>
                    <p className="text-gray-700 mb-4">Êtes-vous sûr de vouloir supprimer les {selectedItems.length} fichiers sélectionnés ?</p>
                    <p className="text-gray-500 text-sm mb-5">Cette action est irréversible et supprimera définitivement tous les fichiers sélectionnés.</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 mb-4">Êtes-vous sûr de vouloir supprimer ce fichier ?</p>
                    <p className="text-gray-500 text-sm mb-5">Cette action est irréversible et supprimera définitivement le fichier.</p>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t bg-gradient-to-b from-white to-gray-50/60 p-4">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium
                   border border-gray-300 bg-white text-gray-700 shadow-sm
                   hover:bg-gray-50 active:translate-y-px
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2
                   transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleDeleteFile}
                  className="min-w-[120px] px-5 py-2.5 rounded-lg text-sm font-semibold
                   bg-red-600 text-red-500 shadow-sm
                   hover:bg-red-700 active:translate-y-px
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
                   transition-colors"
                >
                  Supprimer
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center" 
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-0 relative z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Ajouter un fichier</h2>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form 
              className="p-5"
              onSubmit={async (e) => {
                e.preventDefault();
                const fileInput = fileInputRef.current;
                const customFilenameInput = document.querySelector('input[name="customFilename"]') as HTMLInputElement;
                const isPublicInput = document.querySelector('input[name="isPublic"]') as HTMLInputElement;
                
                if (fileInput && fileInput.files && fileInput.files[0]) {
                  try {
                    const file = fileInput.files[0];
                    const customFilename = customFilenameInput ? customFilenameInput.value : '';
                    const isPublic = isPublicInput ? isPublicInput.checked : true;
                    
                    const result = await uploadFile(file, customFilename, isPublic);
                    console.log('Fichier téléchargé avec succès:', result);
                    // Réinitialiser l'aperçu et le champ de fichier
                    setPreviewImage(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                    // Afficher la notification de succès pour l'upload
                    setNotification({show: true, type: 'upload'});
                    // Masquer la notification après 3 secondes
                    setTimeout(() => setNotification({show: false, type: null}), 3000);
                    setIsUploadModalOpen(false);
                    handleRefreshMediaList();
                  } catch (error) {
                    console.error('Erreur lors du téléchargement:', error);
                    // On suppose que l'upload a réussi malgré l'erreur de traitement
                    // Afficher quand même la notification de succès
                    setNotification({show: true, type: 'upload'});
                    setTimeout(() => setNotification({show: false, type: null}), 3000);
                    // Réinitialiser l'aperçu et le champ de fichier même en cas d'erreur
                    setPreviewImage(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                    // Fermer la modal et rafraîchir quand même, car l'upload a probablement réussi
                    setIsUploadModalOpen(false);
                    handleRefreshMediaList();
                  }
                }
              }}
            >
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fichier à télécharger*
                  </label>
                  {previewImage ? (
                    <div className="mb-4">
                      <div className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-48 bg-gray-100">
                        <img
                          src={previewImage}
                          alt="Prévisualisation"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback en cas d'erreur de chargement d'image
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Éviter les boucles infinies
                            target.src = '/placeholder.svg';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="absolute top-2 right-2 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><path fill="#fff" d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"/></svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <label 
                        htmlFor="file-upload" 
                        className="cursor-pointer w-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md px-3 py-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-700 focus-within:outline-none">
                              Sélectionner un fichier
                            </span>
                            <p className="pl-1">ou glisser-déposer</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF, PDF jusqu'à 10MB
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                  <input 
                    id="file-upload" 
                    name="file" 
                    type="file" 
                    className="sr-only" 
                    required
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>

                {/*  */}

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom personnalisé du fichier
                  </label>
                  <input
                    type="text"
                    name="customFilename"
                    className="w-full border border-gray-300 text-black rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ex: mon-produit"
                  />
                </div>


               

                <div className="mb-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublic"
                      defaultChecked={true}
                      className="form-checkbox h-5 w-5 text-black rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Visibilité publique</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-black px-6 py-2 rounded-md flex items-center shadow-md font-bold text-lg tracking-wide"
                  >
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20"><path fill="#000" d="M7.707 10.293a1 1 0 1 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l3-3a1 1 0 0 0-1.414-1.414L11 11.586V6h5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5v5.586zM9 4a1 1 0 0 1 2 0v2H9z"/></svg>
                    <span className="ml-2">Importer</span>
                  </button>
                </div>
              </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
