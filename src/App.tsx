import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AppHeader } from './components/AppHeader'
import BottomNav from './components/BottomNav'
import HomePage from './routes/index'
import LoginPage from './routes/login'
import ProfilePage from './routes/profile'
import ExperimentsPage from './routes/experiments.index'
import ExperimentDetailPage from './routes/experiments.$experimentId'
import ExperimentReportPage from './routes/experiments.$experimentId.report'
import LearnPage from './routes/learn'
import LocationPage from './routes/learn'
import AssistantPage from './routes/assistant'
import SchemesPage from './routes/schemes'

const queryClient = new QueryClient()

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-green-50 to-amber-50">
      {!isLoginPage && <AppHeader />}
      <main className={`flex-1 overflow-auto ${!isLoginPage ? 'pb-20' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/experiments/:experimentId" element={<ExperimentDetailPage />} />
          <Route path="/experiments/:experimentId/report" element={<ExperimentReportPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
        </Routes>
      </main>
      {!isLoginPage && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}
