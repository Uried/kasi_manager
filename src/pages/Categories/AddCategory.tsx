import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCategory, type CreateCategoryPayload } from '../../services/categoryService';
import MediaLibrarySelector from '../../components/shared/MediaLibrarySelector';

const AddCategory = () => {
  const navigate = useNavigate();

  // Required
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  // Optional
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [icon] = useState('');
  const [order] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [parentId] = useState<string | ''>('');
  const [attributesText] = useState('');
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [seoKeywordsText, setSeoKeywordsText] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim() || !slug.trim()) {
      setError('Les champs "name" et "slug" sont obligatoires.');
      return;
    }

    let attributes: CreateCategoryPayload['attributes'] | undefined;
    if (attributesText.trim()) {
      try {
        attributes = JSON.parse(attributesText);
      } catch (e) {
        setError('Le champ "attributes" doit être un JSON valide.');
        return;
      }
    }

    const seoKeywords = seoKeywordsText
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const payload: CreateCategoryPayload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      icon: icon.trim() || undefined,
      order: order === '' ? undefined : Number(order),
      isActive,
      isFeatured,
      parentId: parentId === '' ? undefined : parentId,
      attributes,
      seo: (seoMetaTitle || seoMetaDescription || seoKeywords.length)
        ? { metaTitle: seoMetaTitle || undefined, metaDescription: seoMetaDescription || undefined, keywords: seoKeywords.length ? seoKeywords : undefined }
        : undefined,
    };

    try {
      setSaving(true);
      await createCategory(payload);
      navigate('/categories');
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de la création de la catégorie.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-700">Création de catégorie</h1>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm space-y-6">
        {/* Required */}
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

        {/* Optional basics */}
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
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Icône (URL)</label>
              <input
                type="url"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="https://exemple.com/icon.svg"
              />
            </div> */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Ordre</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                value={order}
                onChange={(e) => setOrder(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="1"
                min={0}
              />
            </div> */}
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

        {/* Parent */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">Parent ID</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            placeholder="ID de la catégorie parente (optionnel)"
          />
        </div> */}

        {/* Attributes JSON */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">Attributs (JSON)</label>
          <textarea
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            rows={6}
            value={attributesText}
            onChange={(e) => setAttributesText(e.target.value)}
            placeholder='{"couleur": {"name": "Couleur", "values": ["Rouge", "Bleu"], "filterable": true}}'
          />
          <p className="text-xs text-gray-500 mt-1">Laissez vide si non utilisé.</p>
        </div> */}

        {/* SEO */}
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
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
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

export default AddCategory;
