import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import AddBook from './pages/AddBook';
import MyBooks from './pages/MyBooks';
import ExchangeRequests from './pages/ExchangeRequests';
import Profile from './pages/Profile';
import EditBook from "./pages/EditBook";
import DialogsPage from "@/pages/DialogsPage.tsx";


const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/books/add" element={<AddBook />} />
            <Route path="/books/edit/:id" element={<EditBook />} />
            <Route path="/my-books" element={<MyBooks />} />
            <Route path="/exchanges" element={<ExchangeRequests />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/dialogs" element={<DialogsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;