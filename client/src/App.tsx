import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { TaskManager } from './components/TaskManager';
import { AdminPanel } from './components/AdminPanel';
import { Sidebar, Header } from './components/layout';
import { AIAssistant } from './components/AIAssistant';
import { Messages } from './components/Messages';
import { DashboardWidgets } from './components/dashboard';

function App() {
  const { user, isLoading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('tasks');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 40 40" className="w-10 h-10 text-white">
              <path
                fill="currentColor"
                d="M20 4C11.16 4 4 11.16 4 20c0 3.09.88 5.97 2.4 8.4L4 36l7.6-2.4C14.03 35.12 16.91 36 20 36c8.84 0 16-7.16 16-16S28.84 4 20 4zm-2 22v-8h8v-4h-8V8h4v6h8v8h-8v4h-4z"
              />
            </svg>
          </div>
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Phoneme Workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Render admin panel if selected
  if (currentPage === 'admin' && isAdmin) {
    return <AdminPanel onBack={() => setCurrentPage('tasks')} />;
  }

  // Main app with sidebar
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="ml-64 transition-all duration-300">
        <Header
          onOpenAIChat={() => setShowAIChat(true)}
          onOpenMessages={() => setShowMessages(true)}
        />
        <main>
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'tasks' && <TaskManager />}
        </main>
      </div>

      {/* Overlays */}
      <AIAssistant isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
      <Messages isOpen={showMessages} onClose={() => setShowMessages(false)} />
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-xs uppercase font-semibold text-orange-600">Dashboard</p>
        <h1 className="text-2xl font-bold text-gray-900">Performance Overview</h1>
        <p className="text-sm text-gray-500">
          {user?.role === 'admin'
            ? 'View task performance across all projects and users in your workspace.'
            : 'View your task performance and pending assignments.'}
        </p>
      </div>

      <DashboardWidgets />
    </div>
  );
}

export default App;
