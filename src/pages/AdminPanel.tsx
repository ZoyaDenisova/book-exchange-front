import AdminComplaints from "@/pages/AdminComplaints.tsx";
import AdminListings from "@/pages/AdminListings.tsx";
import AdminReviews from "@/pages/AdminReviews.tsx";
import AdminUsers from "@/pages/AdminUsers.tsx";
import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';

const AdminPanel: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>;
  }

  if (!user || !['admin', 'moderator'].includes(user.role.toLowerCase())) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<div>Выберите раздел слева</div>} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="complaints" element={<AdminComplaints />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;
