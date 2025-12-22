import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
}

export function MainLayout({
  children,
  title,
    searchQuery,
    onSearchChange,
    showSearch = false,
  }: MainLayoutProps) {
  const [currentPage, setCurrentPage] = useState('tasks');

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    // Navigation logic can be extended here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <div className="ml-64 transition-all duration-300">
        <Header
          title={title}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          showSearch={showSearch}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export { Sidebar } from './Sidebar';
export { Header } from './Header';
