// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BooksPage from './pages/BooksPage';
import BookDetailsPage from './pages/BookDetailsPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboard from './pages/AdminDashboard';
import LibrarianDashboard from './pages/LibrarianDashboard';
import PrivateRoute from './components/PrivateRoute';
import AddBookPage from './pages/AddBookPage';
import EditBookPage from './pages/EditBookPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100 font-sans text-gray-800"> {/* Reverted to generic Tailwind colors */}
        <Navbar />
        <main className="flex-grow pt-16"> {/* Adjusted pt for basic Navbar height */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/books" element={<BooksPage />} />
             <Route path="/contact" element={<ContactPage />} />
            <Route path="/books/:id" element={<BookDetailsPage />} />

            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/librarian" element={<LibrarianDashboard />} />
              <Route path="/add-book" element={<AddBookPage />} />
              <Route path="/edit-book/:id" element={<EditBookPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;