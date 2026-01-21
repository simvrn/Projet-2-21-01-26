import { useState, useRef } from 'react';
import { Plus, Trash2, ImagePlus } from 'lucide-react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { useFoodStore } from '@/stores';

export function FoodPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'done' | 'todo'>('done');
  const [newDishName, setNewDishName] = useState('');
  const [newDishDetails, setNewDishDetails] = useState('');
  const [newDishImages, setNewDishImages] = useState<string[]>([]);
  const [newDishStatus, setNewDishStatus] = useState<'done' | 'todo'>('done');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { dishes, addDish, updateDish, removeDish } = useFoodStore();

  const filteredDishes = dishes.filter((d) => d.status === activeTab);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewDishImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddDish = () => {
    if (!newDishName.trim()) return;

    addDish({
      id: crypto.randomUUID(),
      name: newDishName.trim(),
      details: newDishDetails,
      images: newDishImages,
      status: newDishStatus,
      createdAt: new Date().toISOString(),
    });

    setNewDishName('');
    setNewDishDetails('');
    setNewDishImages([]);
    setNewDishStatus('done');
    setIsModalOpen(false);
  };

  const toggleDishStatus = (id: string, currentStatus: 'done' | 'todo') => {
    updateDish(id, { status: currentStatus === 'done' ? 'todo' : 'done' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Nourriture</h1>
          <p className="text-dark-400 mt-1">
            <span className="text-accent-400 font-semibold">{dishes.length}</span> plat{dishes.length > 1 ? 's' : ''} enregistré{dishes.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nouveau plat
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'done'
              ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
              : 'text-dark-400 hover:bg-dark-700/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('done')}
        >
          Menus déjà faits ({dishes.filter((d) => d.status === 'done').length})
        </button>
        <button
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'todo'
              ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30'
              : 'text-dark-400 hover:bg-dark-700/50 border border-transparent'
          }`}
          onClick={() => setActiveTab('todo')}
        >
          Menus à faire ({dishes.filter((d) => d.status === 'todo').length})
        </button>
      </div>

      {/* Dishes Grid */}
      {filteredDishes.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-accent-400" />
          </div>
          <p className="text-dark-300">
            {activeTab === 'done'
              ? 'Aucun plat enregistré'
              : 'Aucun plat à essayer'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDishes.map((dish) => (
            <Card key={dish.id} padding="none" hover className="overflow-hidden group">
              {dish.images.length > 0 ? (
                <img
                  src={dish.images[0]}
                  alt={dish.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-dark-700 flex items-center justify-center">
                  <ImagePlus className="w-12 h-12 text-dark-500" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-dark-100">{dish.name}</h3>
                  <button
                    onClick={() => removeDish(dish.id)}
                    className="text-dark-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {dish.details && (
                  <p className="text-sm text-dark-400 mt-2 line-clamp-3">
                    {dish.details}
                  </p>
                )}
                <button
                  onClick={() => toggleDishStatus(dish.id, dish.status)}
                  className="mt-4 text-sm text-accent-400 hover:text-accent-300 transition-colors"
                >
                  {dish.status === 'done'
                    ? 'Marquer à refaire'
                    : 'Marquer comme fait'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dish Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau plat"
      >
        <div className="space-y-4">
          <Input
            label="Nom du plat"
            value={newDishName}
            onChange={(e) => setNewDishName(e.target.value)}
            placeholder="Ex: Poulet rôti aux légumes"
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Détails
            </label>
            <textarea
              value={newDishDetails}
              onChange={(e) => setNewDishDetails(e.target.value)}
              placeholder="Ingrédients, recette, notes..."
              className="input min-h-[100px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Images
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-dark-600 rounded-xl hover:border-accent-500/50 hover:bg-dark-700/30 w-full justify-center transition-all"
            >
              <ImagePlus className="w-5 h-5 text-dark-400" />
              <span className="text-dark-300">Ajouter des images</span>
            </button>
            {newDishImages.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {newDishImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Statut
            </label>
            <select
              value={newDishStatus}
              onChange={(e) =>
                setNewDishStatus(e.target.value as 'done' | 'todo')
              }
              className="input"
            >
              <option value="done">Déjà fait</option>
              <option value="todo">À faire / jamais testé</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleAddDish}>
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
