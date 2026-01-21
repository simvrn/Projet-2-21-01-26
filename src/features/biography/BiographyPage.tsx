import { useState, useRef } from 'react';
import { Plus, Trash2, ImagePlus, Users, Edit2, X, Table, Grid3X3 } from 'lucide-react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { usePersonsStore } from '@/stores';

type ViewMode = 'grid' | 'table';

export function BiographyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form states
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonCategory, setNewPersonCategory] = useState('');
  const [newPersonDescription, setNewPersonDescription] = useState('');
  const [newPersonQualities, setNewPersonQualities] = useState('');
  const [newPersonImage, setNewPersonImage] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#06b6d4');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { persons, categories, addPerson, updatePerson, removePerson, addCategory, removeCategory } =
    usePersonsStore();

  const filteredPersons = filterCategory === 'all'
    ? persons
    : persons.filter((p) => p.categoryId === filterCategory);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewPersonImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setNewPersonName('');
    setNewPersonCategory('');
    setNewPersonDescription('');
    setNewPersonQualities('');
    setNewPersonImage(null);
    setEditingPersonId(null);
  };

  const handleAddPerson = () => {
    if (!newPersonName.trim() || !newPersonCategory) return;

    const qualities = newPersonQualities
      .split(',')
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    if (editingPersonId) {
      updatePerson(editingPersonId, {
        name: newPersonName.trim(),
        categoryId: newPersonCategory,
        description: newPersonDescription,
        qualities,
        image: newPersonImage,
      });
    } else {
      addPerson({
        id: crypto.randomUUID(),
        name: newPersonName.trim(),
        categoryId: newPersonCategory,
        description: newPersonDescription,
        qualities,
        image: newPersonImage,
        createdAt: new Date().toISOString(),
      });
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleEditPerson = (person: typeof persons[0]) => {
    setEditingPersonId(person.id);
    setNewPersonName(person.name);
    setNewPersonCategory(person.categoryId);
    setNewPersonDescription(person.description);
    setNewPersonQualities(person.qualities.join(', '));
    setNewPersonImage(person.image);
    setIsModalOpen(true);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    addCategory({
      id: crypto.randomUUID(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    });

    setNewCategoryName('');
    setNewCategoryColor('#06b6d4');
    setIsCategoryModalOpen(false);
  };

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Biographie</h1>
          <p className="text-dark-400 mt-1">
            <span className="text-accent-400 font-semibold">{persons.length}</span> personne{persons.length > 1 ? 's' : ''} inspirante{persons.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsCategoryModalOpen(true)}>
            Nouvelle catégorie
          </Button>
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle personne
          </Button>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterCategory === 'all'
                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                : 'text-dark-400 hover:bg-dark-700/50 border border-transparent'
            }`}
          >
            Tous ({persons.length})
          </button>
          {categories.map((cat) => {
            const count = persons.filter((p) => p.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterCategory === cat.id
                    ? 'bg-dark-700/80 border border-dark-600'
                    : 'text-dark-400 hover:bg-dark-700/50 border border-transparent'
                }`}
              >
                <button
                  onClick={() => setFilterCategory(cat.id)}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name} ({count})
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (filterCategory === cat.id) setFilterCategory('all');
                    removeCategory(cat.id);
                  }}
                  className="ml-1 p-0.5 text-dark-500 hover:text-red-400 transition-colors rounded"
                  title="Supprimer la catégorie"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-1 bg-dark-800/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-dark-700 text-accent-400'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-dark-700 text-accent-400'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {filteredPersons.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-accent-400" />
          </div>
          <p className="text-dark-300">Aucune personne enregistrée</p>
          <p className="text-sm text-dark-500 mt-2">
            Ajoutez vos personnes inspirantes pour créer votre collection
          </p>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPersons.map((person) => {
            const category = getCategoryById(person.categoryId);
            return (
              <Card key={person.id} padding="none" hover className="overflow-hidden group">
                {person.image ? (
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-dark-700 flex items-center justify-center">
                    <Users className="w-16 h-16 text-dark-500" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-dark-100">{person.name}</h3>
                      {category && (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs mt-1 px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                            border: `1px solid ${category.color}30`,
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditPerson(person)}
                        className="p-1.5 text-dark-400 hover:text-accent-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removePerson(person.id)}
                        className="p-1.5 text-dark-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {person.description && (
                    <p className="text-sm text-dark-400 mt-2 line-clamp-2">
                      {person.description}
                    </p>
                  )}
                  {person.qualities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {person.qualities.slice(0, 3).map((q, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 bg-dark-700/50 text-dark-300 rounded"
                        >
                          {q}
                        </span>
                      ))}
                      {person.qualities.length > 3 && (
                        <span className="text-xs px-2 py-0.5 text-dark-500">
                          +{person.qualities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="text-left p-4 text-sm font-medium text-dark-400">Nom</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-400">Catégorie</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-400">Description</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-400">Qualités</th>
                  <th className="text-right p-4 text-sm font-medium text-dark-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersons.map((person) => {
                  const category = getCategoryById(person.categoryId);
                  return (
                    <tr
                      key={person.id}
                      className="border-b border-dark-700/30 hover:bg-dark-700/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {person.image ? (
                            <img
                              src={person.image}
                              alt={person.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center">
                              <Users className="w-5 h-5 text-dark-500" />
                            </div>
                          )}
                          <span className="font-medium text-dark-100">{person.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {category && (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                              border: `1px solid ${category.color}30`,
                            }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-dark-300 max-w-xs truncate">
                          {person.description || '-'}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {person.qualities.slice(0, 2).map((q, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-dark-700/50 text-dark-300 rounded"
                            >
                              {q}
                            </span>
                          ))}
                          {person.qualities.length > 2 && (
                            <span className="text-xs text-dark-500">
                              +{person.qualities.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEditPerson(person)}
                            className="p-2 text-dark-400 hover:text-accent-400 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removePerson(person.id)}
                            className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Person Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingPersonId ? 'Modifier la personne' : 'Nouvelle personne'}
      >
        <div className="space-y-4">
          {/* Image Upload */}
          <div className="flex justify-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            {newPersonImage ? (
              <div className="relative group">
                <img
                  src={newPersonImage}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button
                  onClick={() => setNewPersonImage(null)}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <ImagePlus className="w-6 h-6 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-dark-600 flex items-center justify-center hover:border-accent-500/50 hover:bg-dark-700/30 transition-all"
              >
                <ImagePlus className="w-8 h-8 text-dark-400" />
              </button>
            )}
          </div>

          <Input
            label="Nom"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Ex: Steve Jobs"
          />

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Catégorie
            </label>
            <select
              value={newPersonCategory}
              onChange={(e) => setNewPersonCategory(e.target.value)}
              className="input"
            >
              <option value="">Sélectionner...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Description
            </label>
            <textarea
              value={newPersonDescription}
              onChange={(e) => setNewPersonDescription(e.target.value)}
              placeholder="Courte biographie, pourquoi cette personne t'inspire..."
              className="input min-h-[80px]"
            />
          </div>

          <Input
            label="Qualités (séparées par des virgules)"
            value={newPersonQualities}
            onChange={(e) => setNewPersonQualities(e.target.value)}
            placeholder="Ex: Visionnaire, Persévérant, Innovateur"
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
            >
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleAddPerson}>
              {editingPersonId ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Nouvelle catégorie"
      >
        <div className="space-y-4">
          <Input
            label="Nom de la catégorie"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ex: Musicien, Écrivain, Leader..."
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Couleur
            </label>
            <div className="flex gap-2">
              {['#06b6d4', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#14b8a6'].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewCategoryColor(color)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    newCategoryColor === color
                      ? 'ring-2 ring-offset-2 ring-offset-surface-light scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color, ringColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleAddCategory}>
              Créer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
