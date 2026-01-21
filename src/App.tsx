import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { HomePage } from '@/features/home/HomePage';
import { ObjectivesPage } from '@/features/objectives/ObjectivesPage';
import { ExpensesPage } from '@/features/expenses/ExpensesPage';
import { ExpenseMonthPage } from '@/features/expenses/ExpenseMonthPage';
import { FoodPage } from '@/features/food/FoodPage';
import { BiographyPage } from '@/features/biography/BiographyPage';
import { RoutinesPage } from '@/features/routines/RoutinesPage';
import { ChallengesPage } from '@/features/challenges/ChallengesPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/objectives" element={<ObjectivesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/expenses/:month" element={<ExpenseMonthPage />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="/biography" element={<BiographyPage />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
