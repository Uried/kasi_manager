import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { getCategoryById, updateCategory, type Category, type CreateCategoryPayload } from '../../services/categoryService';
import MediaLibrarySelector from '../../components/shared/MediaLibrarySelector';

const UpdateCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [seoKeywordsText, setSeoKeywordsText] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const cat: Category = await getCategoryById(id);
        setName(cat.name || '');
        setSlug(cat.slug || '');
        setDescription(cat.description || '');
        setImage(cat.image || '');
        setIsActive(cat.isActive);
        setIsFeatured(cat.isFeatured);
        // If backend returns seo fields separately, adapt here
        setSeoMetaTitle('');
        setSeoMetaDescription('');
        setSeoKeywordsText('');
      } catch (e: any) {
        if (String(e?.message || '').includes('404')) setNotFound(true);
        setError(e?.message || 'Erreur lors du chargement de la catégorie.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const isValid = useMemo(() => name.trim() && slug.trim(), [name, slug]);

  const handleSubmit = async () => {
    if (!id) return;
    setError(null);

    if (!isValid) {
      setError('Les champs "name" et "slug" sont obligatoires.');
      return;
    }

    const seoKeywords = seoKeywordsText
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const payload: Partial<CreateCategoryPayload> = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      isActive,
      isFeatured,
      seo: (seoMetaTitle || seoMetaDescription || seoKeywords.length)
        ? { metaTitle: seoMetaTitle || undefined, metaDescription: seoMetaDescription || undefined, keywords: seoKeywords.length ? seoKeywords : undefined }
        : undefined,
    };

    try {
      setSaving(true);
      await updateCategory(id, payload);
      navigate('/categories');
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de la mise à jour de la catégorie.');
    } finally {
      setSaving(false);
    }
  };

  if (!id) return <Navigate to="/categories" replace />;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-700">Mise à jour de la catégorie</h1>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{error}</div>
        )}
        {notFound && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 text-yellow-800 p-3 text-sm">Catégorie introuvable.</div>
        )}

        <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm space-y-6">
          {loading ? (
            <div className="text-sm text-gray-600">Chargement...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom *</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Homme"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug *</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="homme"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description de la catégorie"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <div className="mt-1 flex items-center gap-3">
                      {image ? (
                        <img src={image} alt="Aperçu" className="h-16 w-16 rounded object-cover border" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                      ) : (
                        <div className="h-16 w-16 rounded border bg-gray-50 flex items-center justify-center text-gray-400 text-xs">Aperçu</div>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsMediaOpen(true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Choisir dans la médiathèque
                        </button>
                        {image && (
                          <button
                            type="button"
                            onClick={() => setImage('')}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Retirer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 mt-6">
                    <label className="inline-flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="inline-flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                      <span className="text-sm text-gray-700">Mise en avant</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SEO - Meta Title</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    value={seoMetaTitle}
                    onChange={(e) => setSeoMetaTitle(e.target.value)}
                    placeholder="Titre Meta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SEO - Meta Description</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    value={seoMetaDescription}
                    onChange={(e) => setSeoMetaDescription(e.target.value)}
                    placeholder="Description Meta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SEO - Mots clés (séparés par des virgules)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    value={seoKeywordsText}
                    onChange={(e) => setSeoKeywordsText(e.target.value)}
                    placeholder="mot-clé1, mot-clé2"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || loading || !isValid}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <MediaLibrarySelector
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={(urls) => { const [url] = urls; setImage(url || ''); }}
        multiple={false}
        currentSelectedImages={image ? [image] : []}
      />
    </>
  );
};

export default UpdateCategory;
