import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {Button} from "@/components/ui/button.tsx";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet.tsx";
import {Menu} from "lucide-react";

const Navbar: React.FC = () => {
  const {user, isAuthenticated, logout} = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  const navLinks = (
    <>
      <Link to="/books" className="text-base font-medium hover:underline" onClick={() => setOpen(false)}>Книги</Link>
      {isAuthenticated ? (
        <>
          <Link to="/my-books" className="text-base font-medium hover:underline" onClick={() => setOpen(false)}>Мои книги</Link>
          <Link to="/books/add" className="text-base font-medium hover:underline" onClick={() => setOpen(false)}>Добавить книгу</Link>
          <Link to="/exchanges" className="text-base font-medium hover:underline" onClick={() => setOpen(false)}>Запросы на обмен</Link>
          {user?.role === 'admin' && (
            <Link to="http://localhost:4200/" className="text-base font-medium text-red-600 hover:underline" onClick={() => setOpen(false)}>
              Админ-панель
            </Link>
          )}
          <Link to="/profile" className="text-base font-medium hover:underline" onClick={() => setOpen(false)}>Профиль</Link>
          <Button
            variant="outline"
            className="px-4 py-2"
            onClick={handleLogout}
            asChild={false}
          >
            Выход
          </Button>
        </>
      ) : (
        <>
          <Link to="/login" className="text-base font-medium hover:underline" onClick={() => setOpen(false)}>Вход</Link>
          <Link to="/register" className="text-base font-medium hover:underline" onClick={() => setOpen(false)}>Регистрация</Link>
        </>
      )}
    </>
  );

  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-colors">
          BookSwap
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks}
        </div>

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
                {navLinks}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );

};

export default Navbar;