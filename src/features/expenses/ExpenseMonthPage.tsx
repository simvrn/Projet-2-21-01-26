import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { useExpensesStore } from '@/stores';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ExpenseMonthPage() {
  const { month } = useParams<{ month: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeDescription, setNewIncomeDescription] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#06b6d4');

  const { expenses, incomes, categories, addExpense, removeExpense, addIncome, removeIncome, addCategory, fetchExpenses, fetchIncomes } =
    useExpensesStore();

  useEffect(() => {
    fetchExpenses();
    fetchIncomes();
  }, [fetchExpenses, fetchIncomes]);

  if (!month) return null;

  const monthDate = parse(month, 'yyyy-MM', new Date());
  const monthExpenses = expenses
    .filter((e) => e.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));

  const monthIncomes = incomes.filter((i) => i.month === month);

  const totalByCategory: Record<string, number> = {};
  monthExpenses.forEach((expense) => {
    totalByCategory[expense.categoryId] =
      (totalByCategory[expense.categoryId] || 0) + expense.amount;
  });

  const expenseTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const incomeTotal = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = incomeTotal - expenseTotal;

  const handleAddExpense = () => {
    if (!newExpenseAmount || !newExpenseCategory) return;

    addExpense({
      id: crypto.randomUUID(),
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryId: newExpenseCategory,
      amount: Math.round(parseFloat(newExpenseAmount) * 100),
      description: newExpenseDescription || undefined,
    });

    setNewExpenseAmount('');
    setNewExpenseCategory('');
    setNewExpenseDescription('');
    setIsModalOpen(false);
  };

  const handleAddIncome = () => {
    if (!newIncomeAmount) return;

    addIncome({
      id: crypto.randomUUID(),
      month: month,
      amount: Math.round(parseFloat(newIncomeAmount) * 100),
      description: newIncomeDescription || undefined,
    });

    setNewIncomeAmount('');
    setNewIncomeDescription('');
    setIsIncomeModalOpen(false);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/expenses">
            <Button variant="ghost" size="sm" className="!p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-100 capitalize">
              {format(monthDate, 'MMMM yyyy', { locale: fr })}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsCategoryModalOpen(true)}>
            Nouvelle catégorie
          </Button>
          <Button variant="secondary" onClick={() => setIsIncomeModalOpen(true)}>
            <TrendingUp className="w-5 h-5 mr-2" />
            Ajouter revenu
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle dépense
          </Button>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-dark-400">Revenus</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {(incomeTotal / 100).toFixed(2)} €
          </p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-sm text-dark-400">Dépenses</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {(expenseTotal / 100).toFixed(2)} €
          </p>
        </Card>
        <Card glow className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-accent-400" />
            <span className="text-sm text-dark-400">Solde</span>
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {balance >= 0 ? '+' : ''}{(balance / 100).toFixed(2)} €
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expenses & Incomes Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incomes */}
          <div className="space-y-4">
            <h2 className="font-semibold text-dark-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Revenus
            </h2>
            {monthIncomes.length === 0 ? (
              <Card className="text-center py-6">
                <p className="text-dark-400">Aucun revenu enregistré</p>
                <button
                  onClick={() => setIsIncomeModalOpen(true)}
                  className="text-sm text-accent-400 hover:text-accent-300 mt-2"
                >
                  + Ajouter un revenu
                </button>
              </Card>
            ) : (
              <div className="space-y-2">
                {monthIncomes.map((income) => (
                  <Card key={income.id} padding="sm" hover className="border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        <div>
                          <p className="font-medium text-emerald-400">
                            +{(income.amount / 100).toFixed(2)} €
                          </p>
                          {income.description && (
                            <p className="text-sm text-dark-400">
                              {income.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeIncome(income.id)}
                        className="text-dark-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Expenses */}
          <div className="space-y-4">
            <h2 className="font-semibold text-dark-100 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Dépenses
            </h2>
            {monthExpenses.length === 0 ? (
              <Card className="text-center py-6">
                <p className="text-dark-400">Aucune dépense ce mois</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {monthExpenses.map((expense) => {
                  const category = categories.find(
                    (c) => c.id === expense.categoryId
                  );
                  return (
                    <Card key={expense.id} padding="sm" hover>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category?.color || '#627d98' }}
                          />
                          <div>
                            <p className="font-medium text-dark-100">
                              {category?.name || 'Autre'}
                            </p>
                            {expense.description && (
                              <p className="text-sm text-dark-400">
                                {expense.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-red-400">
                            -{(expense.amount / 100).toFixed(2)} €
                          </span>
                          <button
                            onClick={() => removeExpense(expense.id)}
                            className="text-dark-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Summary by Category */}
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-100">Récapitulatif dépenses</h2>
          <Card>
            {Object.keys(totalByCategory).length === 0 ? (
              <p className="text-dark-400 text-center py-4">Aucune donnée</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(totalByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([categoryId, amount]) => {
                    const category = categories.find((c) => c.id === categoryId);
                    const percentage = expenseTotal > 0 ? (amount / expenseTotal) * 100 : 0;
                    return (
                      <div key={categoryId}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: category?.color || '#627d98',
                              }}
                            />
                            <span className="text-sm text-dark-300">
                              {category?.name || 'Autre'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-dark-100">
                            {(amount / 100).toFixed(2)} €
                          </span>
                        </div>
                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: category?.color || '#627d98',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle dépense"
      >
        <div className="space-y-4">
          <Input
            label="Montant (€)"
            type="number"
            step="0.01"
            value={newExpenseAmount}
            onChange={(e) => setNewExpenseAmount(e.target.value)}
            placeholder="0.00"
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Catégorie
            </label>
            <select
              value={newExpenseCategory}
              onChange={(e) => setNewExpenseCategory(e.target.value)}
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
          <Input
            label="Description (optionnel)"
            value={newExpenseDescription}
            onChange={(e) => setNewExpenseDescription(e.target.value)}
            placeholder="Note..."
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleAddExpense}>
              Ajouter
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
            placeholder="Ex: Transport"
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Couleur
            </label>
            <div className="flex gap-2">
              {['#06b6d4', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewCategoryColor(color)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    newCategoryColor === color
                      ? 'ring-2 ring-offset-2 ring-offset-surface-light scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
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

      {/* Add Income Modal */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title="Ajouter un revenu"
      >
        <div className="space-y-4">
          <Input
            label="Montant (€)"
            type="number"
            step="0.01"
            value={newIncomeAmount}
            onChange={(e) => setNewIncomeAmount(e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Description (optionnel)"
            value={newIncomeDescription}
            onChange={(e) => setNewIncomeDescription(e.target.value)}
            placeholder="Ex: Salaire, Freelance, Prime..."
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsIncomeModalOpen(false)}
            >
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleAddIncome}>
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
