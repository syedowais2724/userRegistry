import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, User, Loader2, AlertCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/${id}`);
      setUser(response.data);
    } catch (error) {
      toast.error('Failed to load user details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">User Not Found</h3>
        <p className="text-slate-500 mt-2">The requested user profile does not exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 transition-all-custom">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-all-custom">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-700 flex items-end p-6">
          <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white flex items-center justify-center shadow-md">
            <User className="h-10 w-10 text-slate-400" />
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 sm:p-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {user.name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">ID Ref: #{user.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/edit/${user.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all-custom"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Profile</span>
              </Link>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 hover:border-red-300 transition-all-custom"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="flex gap-4 items-start p-4 rounded-xl bg-slate-50/50 border border-slate-100">
              <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</span>
                <span className="block text-slate-900 font-medium mt-1">{formatDate(user.dob)}</span>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-xl bg-slate-50/50 border border-slate-100">
              <div className="h-5 w-5 flex items-center justify-center font-bold text-slate-400 text-sm">Age</div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Age</span>
                <span className="block text-xl font-bold text-brand-600 mt-0.5">{user.age} years old</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-slate-500 text-sm mt-2">
              Are you sure you want to delete <strong>{user.name}</strong>? This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
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
                <span>Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
