import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { path: 'users', label: 'Пользователи' },
  { path: 'listings', label: 'Объявления' },
  { path: 'reviews', label: 'Отзывы' },
  { path: 'complaints', label: 'Жалобы' },
];

const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-60 border-r"> {/* если у тебя navbar 64px высотой */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Разделы</h2>
      </div>
      <div className="flex flex-col gap-2 p-4">
        {links.map(link => (
          <NavLink
            key={link.path}
            to={`/admin/${link.path}`}
            className={({ isActive }) =>
              `px-4 py-2 rounded-md text-sm font-medium border ${
                isActive
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default AdminSidebar;
