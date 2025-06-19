import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button.tsx';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet.tsx';
import { Menu } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Логотип */}
        <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-colors">
          BookSwap
        </Link>

        {/* Центр: ссылки */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-6 ml-10">
            <Link to="/books" className="text-base font-medium hover:underline">Книги</Link>
            <Link to="/exchanges" className="text-base font-medium hover:underline">Запросы на обмен</Link>
            {user?.role === 'admin' && (
              <Link
                to="http://localhost:4200/"
                className="text-base font-medium text-red-600 hover:underline"
              >
                Админ-панель
              </Link>
            )}
          </div>
        )}

        {/* Право: иконки + выход */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate('/books/add')}>
              <span className="text-2xl font-bold">＋</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/exchanges')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h3l4 4 4-4h3a2 2 0 002-2z"
                />
              </svg>
            </Button>
            <Link to={`/profile/${user?.id}`}>
              <img
                src={user?.avatarUrl?.trim() || '/default-avatar.jpg'}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover border"
              />
            </Link>
            <Button variant="outline" className="px-4 py-2" onClick={handleLogout}>
              Выход
            </Button>
          </div>
        )}

        {/* Mobile nav */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="focus:outline-none">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 flex flex-col gap-4 p-4">
              <Link to="/" className="text-xl font-bold mb-4" onClick={() => setOpen(false)}>
                BookSwap
              </Link>
              <div className="flex flex-col gap-4">
                <Link to="/books" onClick={() => setOpen(false)} className="text-base font-medium hover:underline">Книги</Link>
                <Link to="/exchanges" onClick={() => setOpen(false)} className="text-base font-medium hover:underline">Запросы на обмен</Link>
                {user?.role === 'admin' && (
                  <Link to="http://localhost:4200/" onClick={() => setOpen(false)} className="text-base font-medium text-red-600 hover:underline">
                    Админ-панель
                  </Link>
                )}
                <Link to={`/profile/${user?.id}`} onClick={() => setOpen(false)} className="text-base font-medium hover:underline">Профиль</Link>
                <Button variant="outline" className="px-4 py-2" onClick={handleLogout}>
                  Выход
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
