import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { useExpensesStore } from '@/stores';
import { format, startOfYear, eachMonthOfInterval, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

export function ExpensesPage() {
  const { expenses, incomes, categories, fetchExpenses, fetchIncomes, fetchCategories } = useExpensesStore();

  useEffect(() => {
    fetchExpenses();
    fetchIncomes();
    fetchCategories();
  }, [fetchExpenses, fetchIncomes, fetchCategories]);

  const currentYear = new Date().getFullYear();
  const months = eachMonthOfInterval({
    start: startOfYear(new Date(currentYear, 0)),
    end: endOfYear(new Date(currentYear, 0)),
  });

  const getMonthExpenseTotal = (month: Date): number => {
    const monthStr = format(month, 'yyyy-MM');
    return expenses
      .filter((e) => e.date.startsWith(monthStr))
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getMonthIncomeTotal = (month: Date): number => {
    const monthStr = format(month, 'yyyy-MM');
    return incomes
      .filter((i) => i.month === monthStr)
      .reduce((sum, i) => sum + i.amount, 0);
  };

  const getMonthExpensesByCategory = (month: Date) => {
    const monthStr = format(month, 'yyyy-MM');
    const monthExpenses = expenses.filter((e) => e.date.startsWith(monthStr));

    const byCategory: Record<string, number> = {};
    monthExpenses.forEach((expense) => {
      byCategory[expense.categoryId] =
        (byCategory[expense.categoryId] || 0) + expense.amount;
    });

    return byCategory;
  };

  const currentMonthStr = format(new Date(), 'yyyy-MM');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Dépenses</h1>
        <p className="text-dark-400 mt-1">Année {currentYear}</p>
      </div>

      {/* Months Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month) => {
          const expenseTotal = getMonthExpenseTotal(month);
          const incomeTotal = getMonthIncomeTotal(month);
          const balance = incomeTotal - expenseTotal;
          const byCategory = getMonthExpensesByCategory(month);
          const monthId = format(month, 'yyyy-MM');
          const isCurrentMonth = monthId === currentMonthStr;

          return (
            <Link key={monthId} to={`/expenses/${monthId}`}>
              <Card
                hover
                glow={isCurrentMonth}
                className="h-full cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-dark-100 capitalize">
                    {format(month, 'MMMM', { locale: fr })}
                  </h3>
                  {isCurrentMonth && (
                    <span className="badge badge-accent">En cours</span>
                  )}
                </div>

                {/* Income & Expenses Summary */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-medium">
                      {(incomeTotal / 100).toFixed(0)} €
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400 font-medium">
                      {(expenseTotal / 100).toFixed(0)} €
                    </span>
                  </div>
                </div>

                {/* Balance */}
                <div className={`text-2xl font-bold mb-4 ${
                  balance >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {balance >= 0 ? '+' : ''}{(balance / 100).toFixed(2)} <span className="text-lg opacity-70">€</span>
                </div>

                {Object.keys(byCategory).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(byCategory)
                      .slice(0, 3)
                      .map(([categoryId, amount]) => {
                        const category = categories.find(
                          (c) => c.id === categoryId
                        );
                        return (
                          <div
                            key={categoryId}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: category?.color || '#627d98',
                                }}
                              />
                              <span className="text-dark-400">
                                {category?.name || 'Autre'}
                              </span>
                            </div>
                            <span className="text-dark-200 font-medium">
                              {(amount / 100).toFixed(2)} €
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-dark-500">Aucune dépense</p>
                )}

                <div className="mt-4 pt-4 border-t border-dark-700/50 flex items-center justify-end">
                  <span className="text-sm text-dark-400 group-hover:text-accent-400 transition-colors flex items-center gap-1">
                    Voir détails
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
