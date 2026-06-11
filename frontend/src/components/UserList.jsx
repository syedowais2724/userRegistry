import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit2, Trash2, Eye, UserPlus, ShieldAlert, Loader2, Users, CalendarDays, TrendingUp } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Delete modal state
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]); // Re-fetch on search change

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let endpoint = '/users';
      // If there is search query, we fetch via search endpoint (or local filter)
      // The backend supports search via SearchUsersByName. Let's support GET /users?search=name
      if (searchQuery.trim()) {
        endpoint = `/users?search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const response = await api.get(endpoint);
      setUsers(response.data || []);
      setCurrentPage(1); // Reset page on query change
    } catch (error) {
      toast.error('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteUser.id}`);
      toast.success('User removed successfully!');
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setDeleteUser(null);
    } catch (error) {
      toast.error('Could not delete user. Try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Stats calculation
  const totalUsersCount = users.length;
  const averageAge = totalUsersCount > 0 
    ? Math.round(users.reduce((acc, curr) => acc + (curr.age || 0), 0) / totalUsersCount) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage registration database, view ages, and run dynamic analytics.</p>
        </div>
        <Link
          to="/add"
          className="inline-flex items-center gap-2 justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 transition-all-custom active:scale-95"
        >
          <UserPlus className="h-4 w-5" />
          <span>Add New User</span>
        </Link>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-400">Total Users</span>
            <span className="block text-2xl font-bold text-slate-900 mt-0.5">{totalUsersCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-400">Average Age</span>
            <span className="block text-2xl font-bold text-slate-900 mt-0.5">{averageAge} <span className="text-xs font-normal text-slate-400">yrs</span></span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-400">Database Engine</span>
            <span className="block text-md font-bold text-slate-800 mt-1">PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Search and Listing Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/30">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search users by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all-custom"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-700">No users found</h3>
            <p className="text-slate-400 text-sm mt-1">Try refining your search query or add a user to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Date of Birth</th>
                  <th className="px-6 py-4">Calculated Age</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-all-custom">
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-400">
                      #{user.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {formatDate(user.dob)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                        {user.age} yrs
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/users/${user.id}`}
                          title="View Details"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all-custom"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/edit/${user.id}`}
                          title="Edit User"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all-custom"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteUser(user)}
                          title="Delete User"
                          className="p-1.5 rounded-lg border border-red-100 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-all-custom"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, users.length)} of {users.length} registry entries
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all-custom"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all-custom"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 font-sans">Delete User Profile?</h3>
            <p className="text-slate-500 text-sm mt-2 font-sans">
              Are you sure you want to remove <strong>{deleteUser.name}</strong> from the database? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => setDeleteUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all-custom"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:bg-red-400 transition-all-custom active:scale-95"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
