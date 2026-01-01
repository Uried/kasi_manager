import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../../services/fileService';
import type { CategoriesResponse, Category } from '../../services/categoryService';
import { getCategories, deleteCategory } from '../../services/categoryService';

const CategoriesList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res: CategoriesResponse = await getCategories(page, limit);
        setCategories(res.categories);
        setTotal(res.total);
        setError(null);
      } catch (e) {
        console.error('Erreur lors du chargement des catégories:', e);
        setError("Impossible de charger les catégories. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit) || 1;
  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase()));

  const handleOpenDeleteModal = (cat: Category) => {
    setCategoryToDelete(cat);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete._id);
      // Mise à jour locale
      setCategories(prev => prev.filter(c => c._id !== categoryToDelete._id));
      setTotal(prev => Math.max(0, prev - 1));
      setSuccessMsg(`Catégorie "${categoryToDelete.name}" supprimée avec succès.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de la suppression.');
    } finally {
      handleCloseDeleteModal();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-medium text-gray-700">Liste des catégories</h1>
      </div>

      <div className="bg-white rounded-md border border-gray-100 p-4 shadow-sm">
        {successMsg && (
          <div className="mb-3 rounded-md border border-green-200 bg-green-50 text-green-700 p-3 text-sm">
            {successMsg}
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-blue-100 focus:border-blue-300 sm:text-sm transition-colors duration-150 text-gray-900"
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Erreur</h3>
            <p className="mt-1 text-gray-500">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Produits</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mise en avant</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Créée le</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100 border">
                        <img
                          src={cat.image ? formatImageUrl(cat.image) : '/placeholder.svg'}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{cat.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{cat.slug}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-700">{cat.productCount}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${cat.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${cat.isFeatured ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                      {cat.isFeatured ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-700">{new Date(cat.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-right space-x-2">
                    <Link
                      to={`/categories/update/${cat._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenDeleteModal(cat)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-200 rounded-md text-sm text-red-700 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500">Aucune catégorie trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-md border border-gray-200 shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Total catégories: <span className="font-medium text-gray-700">{total}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-200 px-2 py-1.5 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`relative inline-flex items-center px-3 py-1.5 text-sm border ${page === p ? 'z-10 bg-blue-50 text-blue-600 border-blue-200 font-medium' : 'text-gray-600 border-gray-200 hover:bg-gray-50 focus:z-20 focus:outline-none'} transition-colors duration-150`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-200 px-2 py-1.5 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <span className="sr-only">Suivant</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={handleCloseDeleteModal} />
          <div className="relative bg-white rounded-md shadow-lg border border-gray-200 w-full max-w-md p-6 z-10">
            <div className="flex items-start">
              <div className="mr-3 mt-1 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.366-.446 1.12-.446 1.486 0l6.518 7.94c.36.438.04 1.061-.743 1.061H2.482c-.783 0-1.103-.623-.743-1.06l6.518-7.941zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5A.75.75 0 0010 5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Supprimer la catégorie</h3>
                <p className="mt-1 text-sm text-gray-600">Cette action est irréversible. Voulez-vous vraiment supprimer « {categoryToDelete.name} » ?</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center px-3 py-1.5 border border-red-600 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
