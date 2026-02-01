import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui';
import { useChroniclesStore } from '@/stores';
import {
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Edit3,
  FolderPlus,
  FileText,
  Layers,
  Filter,
  ChevronDown,
  Grid3X3,
  List,
  GripVertical,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ChronicleSection, ChronicleSubTheme, ChronicleEntry } from '@/types';

type ViewLevel = 'sections' | 'subthemes' | 'entries' | 'entry-detail' | 'filtered';

export function ChroniquesPage() {
  const {
    sections,
    subThemes,
    entries,
    fetchSections,
    fetchSubThemes,
    fetchEntries,
    addSection,
    updateSection,
    removeSection,
    reorderSections,
    addSubTheme,
    updateSubTheme,
    removeSubTheme,
    reorderSubThemes,
    addEntry,
    updateEntry,
    removeEntry,
    reorderEntries,
  } = useChroniclesStore();

  // Navigation state
  const [viewLevel, setViewLevel] = useState<ViewLevel>('sections');
  const [selectedSection, setSelectedSection] = useState<ChronicleSection | null>(null);
  const [selectedSubTheme, setSelectedSubTheme] = useState<ChronicleSubTheme | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ChronicleEntry | null>(null);

  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubThemeModal, setShowSubThemeModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ChronicleSection | ChronicleSubTheme | ChronicleEntry | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formAnnexe, setFormAnnexe] = useState('');

  // Filter states - Temps reel (approche A)
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // null = "Tous"
  const [activeSectionFilter, setActiveSectionFilter] = useState<string | null>(null); // null = toutes les sections
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);

  // View mode state - grille ou liste
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSections();
    fetchSubThemes();
    fetchEntries();
  }, [fetchSections, fetchSubThemes, fetchEntries]);

  // === SECTIONS TRIEES PAR ORDRE ===
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  // === CATEGORIES DYNAMIQUES (extraites des entrees) ===
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    entries.forEach(entry => {
      if (entry.category) cats.add(entry.category);
    });
    return Array.from(cats).sort();
  }, [entries]);

  // === COMPTEURS PAR CATEGORIE ===
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: entries.length };
    allCategories.forEach(cat => {
      counts[cat] = entries.filter(e => e.category === cat).length;
    });
    return counts;
  }, [entries, allCategories]);

  // === ENTREES FILTREES ===
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Filtre par categorie
    if (activeCategory) {
      filtered = filtered.filter(e => e.category === activeCategory);
    }

    // Filtre par section (via subTheme)
    if (activeSectionFilter) {
      const sectionSubThemeIds = subThemes
        .filter(st => st.sectionId === activeSectionFilter)
        .map(st => st.id);
      filtered = filtered.filter(e => sectionSubThemeIds.includes(e.subThemeId));
    }

    return filtered;
  }, [entries, activeCategory, activeSectionFilter, subThemes]);

  // === CLICK OUTSIDE / ESC pour fermer le dropdown ===
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectionDropdownRef.current && !sectionDropdownRef.current.contains(event.target as Node)) {
        setShowSectionDropdown(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSectionDropdown(false);
      }
    };

    if (showSectionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showSectionDropdown]);

  // === HANDLERS DE FILTRES (temps reel - pas de OK/Annuler) ===
  const handleCategoryClick = useCallback((category: string | null) => {
    setActiveCategory(category);
    // Passer en mode filtre si une categorie est selectionnee
    if (category !== null || activeSectionFilter !== null) {
      setViewLevel('filtered');
    }
  }, [activeSectionFilter]);

  const handleSectionFilterClick = useCallback((sectionId: string | null) => {
    setActiveSectionFilter(sectionId);
    setShowSectionDropdown(false); // Ferme immediatement apres selection
    // Passer en mode filtre si un filtre est actif
    if (sectionId !== null || activeCategory !== null) {
      setViewLevel('filtered');
    }
  }, [activeCategory]);

  const clearAllFilters = useCallback(() => {
    setActiveCategory(null);
    setActiveSectionFilter(null);
    setViewLevel('sections');
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormImage('');
    setFormDescription('');
    setFormCategory('');
    setFormAnnexe('');
    setEditingItem(null);
  };

  // === SECTION HANDLERS ===
  const openSectionModal = (section?: ChronicleSection) => {
    if (section) {
      setEditingItem(section);
      setFormName(section.name);
      setFormImage(section.image || '');
    } else {
      resetForm();
    }
    setShowSectionModal(true);
  };

  const handleSaveSection = async () => {
    if (!formName.trim()) return;

    // Fermer le modal immédiatement pour une meilleure UX
    const name = formName;
    const image = formImage || undefined;
    const isEditing = editingItem && 'order' in editingItem && !('sectionId' in editingItem);
    const editId = isEditing ? editingItem.id : null;

    setShowSectionModal(false);
    resetForm();

    // Exécuter l'opération en arrière-plan
    if (isEditing && editId) {
      updateSection(editId, { name, image });
    } else {
      const newSection: ChronicleSection = {
        id: crypto.randomUUID(),
        name,
        image,
        order: sections.length,
        createdAt: new Date().toISOString(),
      };
      addSection(newSection);
    }
  };

  // === SUB-THEME HANDLERS ===
  const openSubThemeModal = (subTheme?: ChronicleSubTheme) => {
    if (subTheme) {
      setEditingItem(subTheme);
      setFormName(subTheme.name);
      setFormImage(subTheme.image || '');
      setFormDescription(subTheme.description || '');
    } else {
      resetForm();
    }
    setShowSubThemeModal(true);
  };

  const handleSaveSubTheme = async () => {
    if (!formName.trim() || !selectedSection) return;

    // Fermer le modal immédiatement pour une meilleure UX
    const name = formName;
    const image = formImage || undefined;
    const description = formDescription || undefined;
    const sectionId = selectedSection.id;
    const isEditing = editingItem && 'sectionId' in editingItem && !('subThemeId' in editingItem);
    const editId = isEditing ? editingItem.id : null;

    setShowSubThemeModal(false);
    resetForm();

    // Exécuter l'opération en arrière-plan
    if (isEditing && editId) {
      updateSubTheme(editId, { name, image, description });
    } else {
      const sectionSubThemes = subThemes.filter(st => st.sectionId === sectionId);
      const newSubTheme: ChronicleSubTheme = {
        id: crypto.randomUUID(),
        sectionId,
        name,
        image,
        description,
        order: sectionSubThemes.length,
        createdAt: new Date().toISOString(),
      };
      addSubTheme(newSubTheme);
    }
  };

  // === ENTRY HANDLERS ===
  const openEntryModal = (entry?: ChronicleEntry) => {
    if (entry) {
      setEditingItem(entry);
      setFormName(entry.name);
      setFormImage(entry.image || '');
      setFormCategory(entry.category || '');
      setFormDescription(entry.description || '');
      setFormAnnexe(entry.annexe || '');
    } else {
      resetForm();
    }
    setShowEntryModal(true);
  };

  const handleSaveEntry = async () => {
    if (!formName.trim() || !selectedSubTheme) return;

    // Fermer le modal immédiatement pour une meilleure UX
    const name = formName;
    const image = formImage || undefined;
    const category = formCategory || undefined;
    const description = formDescription || undefined;
    const annexe = formAnnexe || undefined;
    const subThemeId = selectedSubTheme.id;
    const isEditing = editingItem && 'subThemeId' in editingItem;
    const editId = isEditing ? editingItem.id : null;

    setShowEntryModal(false);
    resetForm();

    // Exécuter l'opération en arrière-plan
    if (isEditing && editId) {
      updateEntry(editId, { name, image, category, description, annexe });
    } else {
      const subThemeEntries = entries.filter(e => e.subThemeId === subThemeId);
      const newEntry: ChronicleEntry = {
        id: crypto.randomUUID(),
        subThemeId,
        name,
        image,
        category,
        description,
        annexe,
        order: subThemeEntries.length,
        createdAt: new Date().toISOString(),
      };
      addEntry(newEntry);
    }
  };

  // === NAVIGATION ===
  const navigateToSection = (section: ChronicleSection) => {
    setSelectedSection(section);
    setViewLevel('subthemes');
  };

  const navigateToSubTheme = (subTheme: ChronicleSubTheme) => {
    setSelectedSubTheme(subTheme);
    setViewLevel('entries');
  };

  const navigateToEntry = (entry: ChronicleEntry) => {
    setSelectedEntry(entry);
    setViewLevel('entry-detail');
  };

  const navigateBack = () => {
    if (viewLevel === 'entry-detail') {
      setSelectedEntry(null);
      // Si on avait des filtres actifs, retourner a la vue filtree
      if (activeCategory !== null || activeSectionFilter !== null) {
        setViewLevel('filtered');
      } else {
        setViewLevel('entries');
      }
    } else if (viewLevel === 'entries') {
      setSelectedSubTheme(null);
      setViewLevel('subthemes');
    } else if (viewLevel === 'subthemes') {
      setSelectedSection(null);
      setViewLevel('sections');
    } else if (viewLevel === 'filtered') {
      clearAllFilters();
    }
  };

  // Get items for current view
  const currentSubThemes = selectedSection
    ? subThemes.filter(st => st.sectionId === selectedSection.id).sort((a, b) => a.order - b.order)
    : [];
  const currentEntries = selectedSubTheme
    ? entries.filter(e => e.subThemeId === selectedSubTheme.id).sort((a, b) => a.order - b.order)
    : [];

  // === DRAG & DROP ===
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndSections = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sortedSections.findIndex((s) => s.id === active.id);
      const newIndex = sortedSections.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(sortedSections, oldIndex, newIndex);
      reorderSections(newOrder.map((s) => s.id));
    }
  }, [sortedSections, reorderSections]);

  const handleDragEndSubThemes = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && selectedSection) {
      const oldIndex = currentSubThemes.findIndex((st) => st.id === active.id);
      const newIndex = currentSubThemes.findIndex((st) => st.id === over.id);
      const newOrder = arrayMove(currentSubThemes, oldIndex, newIndex);
      reorderSubThemes(selectedSection.id, newOrder.map((st) => st.id));
    }
  }, [currentSubThemes, selectedSection, reorderSubThemes]);

  const handleDragEndEntries = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && selectedSubTheme) {
      const oldIndex = currentEntries.findIndex((e) => e.id === active.id);
      const newIndex = currentEntries.findIndex((e) => e.id === over.id);
      const newOrder = arrayMove(currentEntries, oldIndex, newIndex);
      reorderEntries(selectedSubTheme.id, newOrder.map((e) => e.id));
    }
  }, [currentEntries, selectedSubTheme, reorderEntries]);

  // === SORTABLE COMPONENTS ===
  const SortableSectionCard = ({ section, isGrid }: { section: ChronicleSection; isGrid: boolean }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: section.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    if (isGrid) {
      return (
        <div ref={setNodeRef} style={style}>
          <Card
            hover
            className={`cursor-pointer group relative ${isDragging ? 'shadow-2xl' : ''}`}
            onClick={() => navigateToSection(section)}
          >
            <div
              {...attributes}
              {...listeners}
              className="absolute top-2 left-2 p-1.5 rounded-lg bg-surface-elevated/80 text-ivory-200/40 hover:text-ivory-200 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            {section.image && (
              <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-surface-elevated">
                <img src={section.image} alt={section.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ivory-200 group-hover: transition-all ">
                  {section.name}
                </h3>
                <p className="text-sm text-ivory-200/40 ">
                  {subThemes.filter(st => st.sectionId === section.id).length} sous-themes
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-ivory-200/40 group-hover:text-ivory-200 transition-colors" />
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); openSectionModal(section); }}
                className="p-2 rounded-lg bg-surface-elevated/80 text-ivory-200/60 hover:text-ivory-200"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                className="p-2 rounded-lg bg-surface-elevated/80 text-red-400/60 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      );
    }

    // List view
    return (
      <div ref={setNodeRef} style={style}>
        <Card
          hover
          className={`cursor-pointer group ${isDragging ? 'shadow-2xl' : ''}`}
          onClick={() => navigateToSection(section)}
        >
          <div className="flex items-center gap-4">
            <div
              {...attributes}
              {...listeners}
              className="p-1.5 text-ivory-200/40 hover:text-ivory-200 cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            {section.image && (
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-elevated flex-shrink-0">
                <img src={section.image} alt={section.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-ivory-200 group-hover: transition-all ">
                {section.name}
              </h3>
              <p className="text-sm text-ivory-200/40 ">
                {subThemes.filter(st => st.sectionId === section.id).length} sous-themes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); openSectionModal(section); }}
                className="p-2 rounded-lg text-ivory-200/40 hover:text-ivory-200 hover:bg-gold-400/10 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                className="p-2 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <ChevronRight className="w-5 h-5 text-ivory-200/40 group-hover:text-ivory-200 transition-colors" />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const SortableSubThemeCard = ({ subTheme, isGrid }: { subTheme: ChronicleSubTheme; isGrid: boolean }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: subTheme.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    if (isGrid) {
      return (
        <div ref={setNodeRef} style={style}>
          <Card
            hover
            className={`cursor-pointer group relative ${isDragging ? 'shadow-2xl' : ''}`}
            onClick={() => navigateToSubTheme(subTheme)}
          >
            <div
              {...attributes}
              {...listeners}
              className="absolute top-2 left-2 p-1.5 rounded-lg bg-surface-elevated/80 text-ivory-200/40 hover:text-ivory-200 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            {subTheme.image && (
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-surface-elevated">
                <img src={subTheme.image} alt={subTheme.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ivory-200 group-hover: transition-all ">
                  {subTheme.name}
                </h3>
                {subTheme.description && (
                  <p className="text-sm text-ivory-200/50 mt-1 line-clamp-2">{subTheme.description}</p>
                )}
                <p className="text-xs text-ivory-200/40  mt-2">
                  {entries.filter(e => e.subThemeId === subTheme.id).length} entrees
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-ivory-200/40 group-hover:text-ivory-200 transition-colors" />
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); openSubThemeModal(subTheme); }}
                className="p-2 rounded-lg bg-surface-elevated/80 text-ivory-200/60 hover:text-ivory-200"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeSubTheme(subTheme.id); }}
                className="p-2 rounded-lg bg-surface-elevated/80 text-red-400/60 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      );
    }

    // List view
    return (
      <div ref={setNodeRef} style={style}>
        <Card
          hover
          className={`cursor-pointer group ${isDragging ? 'shadow-2xl' : ''}`}
          onClick={() => navigateToSubTheme(subTheme)}
        >
          <div className="flex items-center gap-4">
            <div
              {...attributes}
              {...listeners}
              className="p-1.5 text-ivory-200/40 hover:text-ivory-200 cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            {subTheme.image && (
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-elevated flex-shrink-0">
                <img src={subTheme.image} alt={subTheme.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-ivory-200 group-hover: transition-all ">
                {subTheme.name}
              </h3>
              {subTheme.description && (
                <p className="text-sm text-ivory-200/50 line-clamp-1">{subTheme.description}</p>
              )}
              <p className="text-xs text-ivory-200/40 ">
                {entries.filter(e => e.subThemeId === subTheme.id).length} entrees
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); openSubThemeModal(subTheme); }}
                className="p-2 rounded-lg text-ivory-200/40 hover:text-ivory-200 hover:bg-gold-400/10 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeSubTheme(subTheme.id); }}
                className="p-2 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <ChevronRight className="w-5 h-5 text-ivory-200/40 group-hover:text-ivory-200 transition-colors" />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const SortableEntryCard = ({ entry, isGrid }: { entry: ChronicleEntry; isGrid: boolean }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: entry.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    if (isGrid) {
      return (
        <div ref={setNodeRef} style={style}>
          <Card
            hover
            className={`cursor-pointer group relative ${isDragging ? 'shadow-2xl' : ''}`}
            onClick={() => navigateToEntry(entry)}
          >
            <div
              {...attributes}
              {...listeners}
              className="absolute top-2 left-2 p-1.5 rounded-lg bg-surface-elevated/80 text-ivory-200/40 hover:text-ivory-200 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            {entry.image && (
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-surface-elevated">
                <img src={entry.image} alt={entry.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {entry.category && (
                  <span className="badge badge-accent text-xs">{entry.category}</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-ivory-200 group-hover: transition-all ">
                {entry.name}
              </h3>
              {entry.description && (
                <p className="text-sm text-ivory-200/50 mt-1 line-clamp-2">{entry.description}</p>
              )}
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); openEntryModal(entry); }}
                className="p-2 rounded-lg bg-surface-elevated/80 text-ivory-200/60 hover:text-ivory-200"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                className="p-2 rounded-lg bg-surface-elevated/80 text-red-400/60 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      );
    }

    // List view
    return (
      <div ref={setNodeRef} style={style}>
        <Card
          hover
          className={`cursor-pointer group ${isDragging ? 'shadow-2xl' : ''}`}
          onClick={() => navigateToEntry(entry)}
        >
          <div className="flex items-center gap-4">
            <div
              {...attributes}
              {...listeners}
              className="p-1.5 text-ivory-200/40 hover:text-ivory-200 cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            {entry.image && (
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-elevated flex-shrink-0">
                <img src={entry.image} alt={entry.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {entry.category && (
                  <span className="badge badge-accent text-xs">{entry.category}</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-ivory-200 group-hover: transition-all ">
                {entry.name}
              </h3>
              {entry.description && (
                <p className="text-sm text-ivory-200/50 line-clamp-1">{entry.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); openEntryModal(entry); }}
                className="p-2 rounded-lg text-ivory-200/40 hover:text-ivory-200 hover:bg-gold-400/10 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                className="p-2 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <ChevronRight className="w-5 h-5 text-ivory-200/40 group-hover:text-ivory-200 transition-colors" />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Breadcrumb
  const renderBreadcrumb = () => {
    const parts: { label: string; onClick?: () => void }[] = [
      { label: 'Chroniques', onClick: () => { setViewLevel('sections'); setSelectedSection(null); setSelectedSubTheme(null); setSelectedEntry(null); } }
    ];

    if (selectedSection) {
      parts.push({ label: selectedSection.name, onClick: () => { setViewLevel('subthemes'); setSelectedSubTheme(null); setSelectedEntry(null); } });
    }
    if (selectedSubTheme) {
      parts.push({ label: selectedSubTheme.name, onClick: () => { setViewLevel('entries'); setSelectedEntry(null); } });
    }
    if (selectedEntry) {
      parts.push({ label: selectedEntry.name });
    }

    return (
      <div className="flex items-center gap-2 text-sm  mb-6">
        {parts.map((part, index) => (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-ivory-200/40" />}
            {part.onClick ? (
              <button
                onClick={part.onClick}
                className="text-ivory-200/70 hover:text-ivory-200 transition-colors"
              >
                {part.label}
              </button>
            ) : (
              <span className="text-ivory-200">{part.label}</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {viewLevel !== 'sections' && viewLevel !== 'filtered' && (
            <button onClick={navigateBack} className="btn btn-ghost p-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-ivory-200  ">
              {viewLevel === 'sections' && 'Chroniques'}
              {viewLevel === 'filtered' && 'Recherche'}
              {viewLevel === 'subthemes' && selectedSection?.name}
              {viewLevel === 'entries' && selectedSubTheme?.name}
              {viewLevel === 'entry-detail' && selectedEntry?.name}
            </h1>
            <p className="text-ivory-200/60 mt-1  text-sm">
              {viewLevel === 'sections' && '// Sections principales'}
              {viewLevel === 'filtered' && '// Resultats filtres'}
              {viewLevel === 'subthemes' && '// Sous-themes'}
              {viewLevel === 'entries' && '// Entrees'}
              {viewLevel === 'entry-detail' && '// Detail'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle vue grille/liste */}
          {viewLevel !== 'entry-detail' && (
            <div className="flex items-center bg-surface-elevated rounded-lg p-1 border border-gold-400/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gold-400 text-surface'
                    : 'text-ivory-200/60 hover:text-ivory-200'
                }`}
                title="Vue grille"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-gold-400 text-surface'
                    : 'text-ivory-200/60 hover:text-ivory-200'
                }`}
                title="Vue liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Boutons d'action */}
          {viewLevel === 'sections' && (
            <button onClick={() => openSectionModal()} className="btn btn-primary flex items-center gap-2">
              <FolderPlus className="w-5 h-5" />
              Nouvelle Section
            </button>
          )}
          {viewLevel === 'subthemes' && (
            <button onClick={() => openSubThemeModal()} className="btn btn-primary flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Nouveau Sous-theme
            </button>
          )}
          {viewLevel === 'entries' && (
            <button onClick={() => openEntryModal()} className="btn btn-primary flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Nouvelle Entree
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      {viewLevel !== 'sections' && viewLevel !== 'filtered' && renderBreadcrumb()}

      {/* === BARRE DE FILTRES === */}
      {viewLevel !== 'entry-detail' && entries.length > 0 && (
        <div className="space-y-4">
          {/* Categories principales - Filtrage immediat au clic */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ivory-200/60  mr-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Filtrer:
            </span>

            {/* Bouton "Tous" */}
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-3 py-1.5 rounded-lg  text-sm transition-all ${
                activeCategory === null
                  ? 'bg-gold-400 text-surface '
                  : 'bg-surface-elevated text-ivory-200/70 hover:text-ivory-200 hover:bg-gold-400/10 border border-gold-400/20'
              }`}
            >
              Tous
              <span className="ml-1.5 text-xs opacity-70">({categoryCounts.all})</span>
            </button>

            {/* Boutons categories dynamiques */}
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-3 py-1.5 rounded-lg  text-sm transition-all ${
                  activeCategory === category
                    ? 'bg-gold-400 text-surface '
                    : 'bg-surface-elevated text-ivory-200/70 hover:text-ivory-200 hover:bg-gold-400/10 border border-gold-400/20'
                }`}
              >
                {category}
                <span className="ml-1.5 text-xs opacity-70">({categoryCounts[category] || 0})</span>
              </button>
            ))}
          </div>

          {/* Sous-filtre par section - Dropdown temps reel */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={sectionDropdownRef}>
              <button
                onClick={() => setShowSectionDropdown(!showSectionDropdown)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg  text-sm transition-all ${
                  activeSectionFilter
                    ? 'bg-gold-400/20 text-ivory-200 border border-gold-400/50'
                    : 'bg-surface-elevated text-ivory-200/70 hover:text-ivory-200 border border-gold-400/20'
                }`}
              >
                <Layers className="w-4 h-4" />
                {activeSectionFilter
                  ? sections.find(s => s.id === activeSectionFilter)?.name || 'Section'
                  : 'Toutes les sections'
                }
                <ChevronDown className={`w-4 h-4 transition-transform ${showSectionDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu - Filtrage temps reel (pas de OK/Annuler) */}
              {showSectionDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-surface-elevated border border-gold-400/30 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-1">
                    {/* Option "Toutes les sections" */}
                    <button
                      onClick={() => handleSectionFilterClick(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg  text-sm transition-all ${
                        activeSectionFilter === null
                          ? 'bg-gold-400/20 text-ivory-200'
                          : 'text-ivory-200/70 hover:bg-gold-400/10 hover:text-ivory-200'
                      }`}
                    >
                      Toutes les sections
                    </button>

                    {/* Sections */}
                    {sections.map(section => {
                      const count = entries.filter(e => {
                        const st = subThemes.find(s => s.id === e.subThemeId);
                        return st?.sectionId === section.id;
                      }).length;

                      return (
                        <button
                          key={section.id}
                          onClick={() => handleSectionFilterClick(section.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg  text-sm transition-all flex items-center justify-between ${
                            activeSectionFilter === section.id
                              ? 'bg-gold-400/20 text-ivory-200'
                              : 'text-ivory-200/70 hover:bg-gold-400/10 hover:text-ivory-200'
                          }`}
                        >
                          <span>{section.name}</span>
                          <span className="text-xs opacity-60">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bouton effacer les filtres */}
            {(activeCategory !== null || activeSectionFilter !== null) && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm  text-red-400/70 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
                Effacer les filtres
              </button>
            )}
          </div>

          {/* Indicateur de resultats */}
          {viewLevel === 'filtered' && (
            <div className="text-sm text-ivory-200/60 ">
              {filteredEntries.length} entree{filteredEntries.length > 1 ? 's' : ''} trouvee{filteredEntries.length > 1 ? 's' : ''}
              {activeCategory && ` dans "${activeCategory}"`}
              {activeSectionFilter && ` (${sections.find(s => s.id === activeSectionFilter)?.name})`}
            </div>
          )}
        </div>
      )}

      {/* Content - SECTIONS */}
      {viewLevel === 'sections' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndSections}
        >
          {/* Vue Grille */}
          {viewMode === 'grid' && (
            <SortableContext items={sortedSections.map(s => s.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedSections.map((section) => (
                  <SortableSectionCard key={section.id} section={section} isGrid={true} />
                ))}
                {/* Add Section Button */}
                <button
                  onClick={() => openSectionModal()}
                  className="card p-6 border-dashed border-2 border-gold-400/20 hover:border-gold-400/50 flex flex-col items-center justify-center gap-2 min-h-[200px] text-ivory-200/40 hover:text-ivory-200 transition-all"
                >
                  <Plus className="w-10 h-10" />
                  <span className="">Ajouter une section</span>
                </button>
              </div>
            </SortableContext>
          )}

          {/* Vue Liste */}
          {viewMode === 'list' && (
            <SortableContext items={sortedSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sortedSections.map((section) => (
                  <SortableSectionCard key={section.id} section={section} isGrid={false} />
                ))}
                {/* Add Section Button */}
                <button
                  onClick={() => openSectionModal()}
                  className="w-full card p-4 border-dashed border-2 border-gold-400/20 hover:border-gold-400/50 flex items-center justify-center gap-2 text-ivory-200/40 hover:text-ivory-200 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="">Ajouter une section</span>
                </button>
              </div>
            </SortableContext>
          )}
        </DndContext>
      )}

      {/* Content - SUBTHEMES */}
      {viewLevel === 'subthemes' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndSubThemes}
        >
          {/* Vue Grille */}
          {viewMode === 'grid' && (
            <SortableContext items={currentSubThemes.map(st => st.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentSubThemes.map((subTheme) => (
                  <SortableSubThemeCard key={subTheme.id} subTheme={subTheme} isGrid={true} />
                ))}
                {/* Add SubTheme Button */}
                <button
                  onClick={() => openSubThemeModal()}
                  className="card p-6 border-dashed border-2 border-gold-400/20 hover:border-gold-400/50 flex flex-col items-center justify-center gap-2 min-h-[150px] text-ivory-200/40 hover:text-ivory-200 transition-all"
                >
                  <Plus className="w-8 h-8" />
                  <span className=" text-sm">Ajouter un sous-theme</span>
                </button>
              </div>
            </SortableContext>
          )}

          {/* Vue Liste */}
          {viewMode === 'list' && (
            <SortableContext items={currentSubThemes.map(st => st.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {currentSubThemes.map((subTheme) => (
                  <SortableSubThemeCard key={subTheme.id} subTheme={subTheme} isGrid={false} />
                ))}
                {/* Add SubTheme Button */}
                <button
                  onClick={() => openSubThemeModal()}
                  className="w-full card p-4 border-dashed border-2 border-gold-400/20 hover:border-gold-400/50 flex items-center justify-center gap-2 text-ivory-200/40 hover:text-ivory-200 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className=" text-sm">Ajouter un sous-theme</span>
                </button>
              </div>
            </SortableContext>
          )}
        </DndContext>
      )}

      {/* Content - ENTRIES */}
      {viewLevel === 'entries' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndEntries}
        >
          {/* Vue Grille */}
          {viewMode === 'grid' && (
            <SortableContext items={currentEntries.map(e => e.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentEntries.map((entry) => (
                  <SortableEntryCard key={entry.id} entry={entry} isGrid={true} />
                ))}
                {/* Add Entry Button */}
                <button
                  onClick={() => openEntryModal()}
                  className="card p-6 border-dashed border-2 border-gold-400/20 hover:border-gold-400/50 flex flex-col items-center justify-center gap-2 min-h-[150px] text-ivory-200/40 hover:text-ivory-200 transition-all"
                >
                  <Plus className="w-8 h-8" />
                  <span className=" text-sm">Ajouter une entree</span>
                </button>
              </div>
            </SortableContext>
          )}

          {/* Vue Liste */}
          {viewMode === 'list' && (
            <SortableContext items={currentEntries.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {currentEntries.map((entry) => (
                  <SortableEntryCard key={entry.id} entry={entry} isGrid={false} />
                ))}
                {/* Add Entry Button */}
                <button
                  onClick={() => openEntryModal()}
                  className="w-full card p-4 border-dashed border-2 border-gold-400/20 hover:border-gold-400/50 flex items-center justify-center gap-2 text-ivory-200/40 hover:text-ivory-200 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className=" text-sm">Ajouter une entree</span>
                </button>
              </div>
            </SortableContext>
          )}
        </DndContext>
      )}

      {viewLevel === 'entry-detail' && selectedEntry && (
        <Card className="max-w-4xl">
          {selectedEntry.image && (
            <div className="w-full h-64 rounded-xl overflow-hidden mb-6 bg-surface-elevated">
              <img src={selectedEntry.image} alt={selectedEntry.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-4">
            {selectedEntry.category && (
              <span className="badge badge-accent">{selectedEntry.category}</span>
            )}
            <h2 className="text-2xl font-bold text-ivory-200  ">
              {selectedEntry.name}
            </h2>
            {selectedEntry.description && (
              <div>
                <h3 className="text-sm  text-ivory-200/60 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-ivory-200/80 whitespace-pre-wrap">{selectedEntry.description}</p>
              </div>
            )}
            {selectedEntry.annexe && (
              <div className="pt-4 border-t border-gold-400/20">
                <h3 className="text-sm  text-ivory-200/60 uppercase tracking-wider mb-2">Annexe</h3>
                <p className="text-ivory-200/70 whitespace-pre-wrap">{selectedEntry.annexe}</p>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <button onClick={() => openEntryModal(selectedEntry)} className="btn btn-secondary flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => { removeEntry(selectedEntry.id); navigateBack(); }}
                className="btn btn-ghost text-red-400 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* === VUE FILTREE === */}
      {viewLevel === 'filtered' && (
        <>
          {/* Vue Grille */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntries.map((entry) => {
                const entrySubTheme = subThemes.find(st => st.id === entry.subThemeId);
                const entrySection = entrySubTheme ? sections.find(s => s.id === entrySubTheme.sectionId) : null;

                return (
                  <Card
                    key={entry.id}
                    hover
                    className="cursor-pointer group relative"
                    onClick={() => {
                      if (entrySection && entrySubTheme) {
                        setSelectedSection(entrySection);
                        setSelectedSubTheme(entrySubTheme);
                        setSelectedEntry(entry);
                        setViewLevel('entry-detail');
                      }
                    }}
                  >
                    {entry.image && (
                      <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-surface-elevated">
                        <img src={entry.image} alt={entry.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-ivory-200/40  mb-2">
                        {entrySection?.name} / {entrySubTheme?.name}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        {entry.category && (
                          <span className="badge badge-accent text-xs">{entry.category}</span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-ivory-200 group-hover: transition-all ">
                        {entry.name}
                      </h3>
                      {entry.description && (
                        <p className="text-sm text-ivory-200/50 mt-1 line-clamp-2">{entry.description}</p>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (entrySubTheme) {
                            setSelectedSubTheme(entrySubTheme);
                            openEntryModal(entry);
                          }
                        }}
                        className="p-2 rounded-lg bg-surface-elevated/80 text-ivory-200/60 hover:text-ivory-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                        className="p-2 rounded-lg bg-surface-elevated/80 text-red-400/60 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}

              {filteredEntries.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-ivory-200/50 ">Aucune entree ne correspond aux filtres selectionnes</p>
                  <button onClick={clearAllFilters} className="btn btn-secondary mt-4">
                    Effacer les filtres
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Vue Liste */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              {filteredEntries.map((entry) => {
                const entrySubTheme = subThemes.find(st => st.id === entry.subThemeId);
                const entrySection = entrySubTheme ? sections.find(s => s.id === entrySubTheme.sectionId) : null;

                return (
                  <Card
                    key={entry.id}
                    hover
                    className="cursor-pointer group"
                    onClick={() => {
                      if (entrySection && entrySubTheme) {
                        setSelectedSection(entrySection);
                        setSelectedSubTheme(entrySubTheme);
                        setSelectedEntry(entry);
                        setViewLevel('entry-detail');
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {entry.image && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-elevated flex-shrink-0">
                          <img src={entry.image} alt={entry.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-ivory-200/40  mb-1">
                          {entrySection?.name} / {entrySubTheme?.name}
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          {entry.category && (
                            <span className="badge badge-accent text-xs">{entry.category}</span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-ivory-200 group-hover: transition-all ">
                          {entry.name}
                        </h3>
                        {entry.description && (
                          <p className="text-sm text-ivory-200/50 line-clamp-1">{entry.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (entrySubTheme) {
                              setSelectedSubTheme(entrySubTheme);
                              openEntryModal(entry);
                            }
                          }}
                          className="p-2 rounded-lg text-ivory-200/40 hover:text-ivory-200 hover:bg-gold-400/10 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                          className="p-2 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-ivory-200/40 group-hover:text-ivory-200 transition-colors" />
                      </div>
                    </div>
                  </Card>
                );
              })}

              {filteredEntries.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-ivory-200/50 ">Aucune entree ne correspond aux filtres selectionnes</p>
                  <button onClick={clearAllFilters} className="btn btn-secondary mt-4">
                    Effacer les filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-ivory-200 ">
                {editingItem ? 'Modifier la section' : 'Nouvelle section'}
              </h2>
              <button onClick={() => { setShowSectionModal(false); resetForm(); }} className="btn btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-gold-400/30 hover:border-gold-400/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors"
                >
                  {formImage ? (
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-ivory-200/40 mb-2" />
                      <span className="text-sm text-ivory-200/40">Cliquer pour ajouter</span>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <div>
                <label className="label">Nom *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input"
                  placeholder="Nom de la section"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setShowSectionModal(false); resetForm(); }} className="btn btn-secondary">
                  Annuler
                </button>
                <button onClick={handleSaveSection} disabled={!formName.trim()} className="btn btn-primary">
                  {editingItem ? 'Modifier' : 'Creer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTheme Modal */}
      {showSubThemeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-ivory-200 ">
                {editingItem ? 'Modifier le sous-theme' : 'Nouveau sous-theme'}
              </h2>
              <button onClick={() => { setShowSubThemeModal(false); resetForm(); }} className="btn btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-gold-400/30 hover:border-gold-400/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors"
                >
                  {formImage ? (
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-ivory-200/40 mb-2" />
                      <span className="text-sm text-ivory-200/40">Cliquer pour ajouter</span>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <div>
                <label className="label">Nom *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input"
                  placeholder="Nom du sous-theme"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="input min-h-[80px]"
                  placeholder="Description..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setShowSubThemeModal(false); resetForm(); }} className="btn btn-secondary">
                  Annuler
                </button>
                <button onClick={handleSaveSubTheme} disabled={!formName.trim()} className="btn btn-primary">
                  {editingItem ? 'Modifier' : 'Creer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-ivory-200 ">
                {editingItem ? 'Modifier l\'entree' : 'Nouvelle entree'}
              </h2>
              <button onClick={() => { setShowEntryModal(false); resetForm(); }} className="btn btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-gold-400/30 hover:border-gold-400/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors"
                >
                  {formImage ? (
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-ivory-200/40 mb-2" />
                      <span className="text-sm text-ivory-200/40">Cliquer pour ajouter</span>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <div>
                <label className="label">Nom *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input"
                  placeholder="Nom de l'entree"
                />
              </div>
              <div>
                <label className="label">Categorie</label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="input"
                  placeholder="Ex: Concept, Idee, Reference..."
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Description principale..."
                />
              </div>
              <div>
                <label className="label">Annexe</label>
                <textarea
                  value={formAnnexe}
                  onChange={(e) => setFormAnnexe(e.target.value)}
                  className="input min-h-[80px]"
                  placeholder="Contenu complementaire..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setShowEntryModal(false); resetForm(); }} className="btn btn-secondary">
                  Annuler
                </button>
                <button onClick={handleSaveEntry} disabled={!formName.trim()} className="btn btn-primary">
                  {editingItem ? 'Modifier' : 'Creer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
