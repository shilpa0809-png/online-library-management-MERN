import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingBorrowings, setLoadingBorrowings] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [borrowingsError, setBorrowingsError] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    } else if (user && user.role === 'admin') {
      fetchAllUsers();
      fetchAllBorrowings();
    }
  }, [user, navigate]);

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      setUsersError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsersError('Failed to load users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAllBorrowings = async () => {
    setLoadingBorrowings(true);
    try {
      const res = await api.get('/borrowings');
      setBorrowings(res.data);
      setBorrowingsError(null);
    } catch (err) {
      console.error('Error fetching borrowings:', err);
      setBorrowingsError('Failed to load borrowing records.');
    } finally {
      setLoadingBorrowings(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) {
      setMessage('');
      setError('');
      try {
        await api.delete(`/users/${userId}`);
        setMessage(`User "${userName}" deleted successfully!`);
        fetchAllUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user.');
      }
    }
  };

  const handleReturnBookAsAdmin = async (borrowingId, bookTitle) => {
    if (window.confirm(`Are you sure you want to mark "${bookTitle}" as returned?`)) {
      setMessage('');
      setError('');
      try {
        await api.put(`/borrowings/return/${borrowingId}`);
        setMessage(`Book "${bookTitle}" marked as returned.`);
        fetchAllBorrowings();
      } catch (err) {
        console.error('Error returning book:', err);
        setError('Failed to return book.');
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-loading">
        <LoadingSpinner />
        <p>Loading user data or unauthorized...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h2 className="admin-title">Admin Dashboard</h2>

      {message && <p className="admin-message success">{message}</p>}
      {error && <p className="admin-message error">{error}</p>}

      <section className="admin-section">
        <h3>User Management</h3>
        {loadingUsers ? (
          <LoadingSpinner />
        ) : usersError ? (
          <p className="error">{usersError}</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td className="capitalize">{u.role}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(u._id, u.name)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-section">
        <h3>All Borrowing Records</h3>
        {loadingBorrowings ? (
          <LoadingSpinner />
        ) : borrowingsError ? (
          <p className="error">{borrowingsError}</p>
        ) : borrowings.length === 0 ? (
          <p>No borrowing records found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Book</th>
                  <th>Borrowed On</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.user?.name || 'N/A'}</td>
                    <td>{b.book?.title || 'N/A'}</td>
                    <td>{new Date(b.borrowDate).toLocaleDateString()}</td>
                    <td>{new Date(b.returnDate).toLocaleDateString()}</td>
                    <td className="capitalize">{b.status}</td>
                    <td>${b.fineAmount ? b.fineAmount.toFixed(2) : '0.00'}</td>
                    <td>
                      {b.status !== 'returned' && (
                        <button
                          className="return-btn"
                          onClick={() =>
                            handleReturnBookAsAdmin(b._id, b.book?.title || 'Unknown Book')
                          }
                        >
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
