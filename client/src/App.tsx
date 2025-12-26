import { useMemo, useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { TaskManager } from './components/TaskManager';
import { AdminPanel } from './components/AdminPanel';
import { FinancialInsights, PublicFinancialInsights } from './components/FinancialInsights';
import { Sidebar, Header } from './components/layout';
import { AIAssistant } from './components/AIAssistant';
import { Messages } from './components/Messages';
import { useTodos } from './hooks/useTodos';

function App() {
  const { user, isLoading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('tasks');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // Check for public financial insights route
  const isPublicFinancialsRoute = window.location.pathname === '/financials/public';

  // Handle browser navigation for public route
  useEffect(() => {
    const handlePopState = () => {
      // Force re-render when navigating
      window.location.reload();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Render public financial insights without authentication
  if (isPublicFinancialsRoute) {
    return <PublicFinancialInsights />;
  }

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

  // Render financial insights if selected (admin only)
  if (currentPage === 'financials' && isAdmin) {
    return <FinancialInsights onBack={() => setCurrentPage('tasks')} />;
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
  const { data: todos, isLoading } = useTodos();
  const { user } = useAuth();

  const sortedTodos = useMemo(
    () => (todos ? [...todos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []),
    [todos],
  );

  const groupedByProject = useMemo(() => {
    const map = new Map<
      number,
      {
        projectId: number;
        projectName: string;
        projectIcon?: string;
        tasks: typeof sortedTodos;
      }
    >();
    sortedTodos.forEach((todo) => {
      const entry = map.get(todo.projectId);
      if (!entry) {
        map.set(todo.projectId, {
          projectId: todo.projectId,
          projectName: todo.projectName,
          projectIcon: todo.projectIcon,
          tasks: [todo],
        });
      } else {
        entry.tasks.push(todo);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const latestA = new Date(a.tasks[0]?.createdAt || 0).getTime();
      const latestB = new Date(b.tasks[0]?.createdAt || 0).getTime();
      return latestB - latestA;
    });
  }, [sortedTodos]);

  const stats = useMemo(() => {
    if (!todos) return { total: 0, pending: 0, completed: 0 };
    return {
      total: todos.length,
      pending: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    };
  }, [todos]);

  const timeStatus = (dueDate?: string) => {
    if (!dueDate) return { label: 'No due date', tone: 'text-gray-600 bg-gray-100' };
    const diff = new Date(dueDate).getTime() - Date.now();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    if (diff < 0) {
      return { label: `${Math.abs(days)}d overdue`, tone: 'text-red-700 bg-red-100' };
    }
    if (days === 0) {
      return { label: 'Due today', tone: 'text-orange-700 bg-orange-100' };
    }
    return { label: `${days}d left`, tone: 'text-emerald-700 bg-emerald-100' };
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase font-semibold text-orange-600">Dashboard</p>
          <h1 className="text-2xl font-bold text-gray-900">Project snapshots</h1>
          <p className="text-sm text-gray-500">
            Recent tasks {user?.role === 'admin' ? 'across the workspace' : 'assigned to or created by you'} sorted by
            most recent.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-center">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg font-semibold text-orange-600">{stats.pending}</p>
          </div>
          <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-center">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-lg font-semibold text-emerald-600">{stats.completed}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      ) : groupedByProject.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
          <p className="text-gray-600 text-sm">No tasks to display yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groupedByProject.map((project) => (
            <div
              key={project.projectId}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-semibold">
                    {project.projectIcon?.slice(0, 2)?.toUpperCase() || project.projectName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500">Project</p>
                    <p className="text-sm font-semibold text-gray-900">{project.projectName}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{project.tasks.length} tasks</span>
              </div>

              <div className="space-y-3">
                {project.tasks.slice(0, 4).map((task) => {
                  const status = timeStatus(task.dueDate);
                  return (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{task.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                        </div>
                        <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${status.tone}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                        <div className="flex -space-x-2">
                          <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-700">
                            {initials(task.assignerName)}
                          </div>
                          <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-[11px] font-semibold text-orange-700">
                            {initials(task.assigneeName)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                              task.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            {task.completed ? 'Done' : 'Open'}
                          </span>
                          <span className="text-gray-500">
                            {new Date(task.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
