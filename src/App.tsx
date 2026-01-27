import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { HomePage } from '@/features/home/HomePage';
import { ObjectivesPage } from '@/features/objectives/ObjectivesPage';
import { ExpensesPage } from '@/features/expenses/ExpensesPage';
import { ExpenseMonthPage } from '@/features/expenses/ExpenseMonthPage';
import { RoutinesPage } from '@/features/routines/RoutinesPage';
import { ChallengesPage } from '@/features/challenges/ChallengesPage';
import { CalendarPage } from '@/features/calendar/CalendarPage';
import { FinancePage } from '@/features/finance/FinancePage';
import { ChroniquesPage } from '@/features/chroniques/ChroniquesPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/objectives" element={<ObjectivesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/expenses/:month" element={<ExpenseMonthPage />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/chroniques" element={<ChroniquesPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
