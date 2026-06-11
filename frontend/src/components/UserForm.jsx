import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Save, Loader2 } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    setFetching(true);
    try {
      const response = await api.get(`/users/${id}`);
      // Assuming response contains name and dob ("YYYY-MM-DD")
      const user = response.data;
      
      // Extract date part from DOB (handles if backend returns RFC3339 timestamp)
      let formattedDob = '';
      if (user.dob) {
        formattedDob = user.dob.substring(0, 10);
      }

      setFormData({
        name: user.name || '',
        dob: formattedDob,
      });
    } catch (error) {
      toast.error('Failed to load user details');
      navigate('/');
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of Birth is required';
    } else {
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.dob = 'Date of Birth cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        dob: formData.dob, // Format is already YYYY-MM-DD
      };

      if (isEditMode) {
        await api.put(`/users/${id}`, payload);
        toast.success('User updated successfully!');
      } else {
        await api.post('/users', payload);
        toast.success('User created successfully!');
      }
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.error || 'An error occurred. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
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
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isEditMode ? 'Edit User Details' : 'Register New User'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode ? 'Modify user info below and click save.' : 'Fill out the form below to create a new user.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alice Smith"
                className={`block w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all-custom ${
                  errors.name ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-semibold text-slate-700 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="h-5 w-5" />
              </div>
              <input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`block w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all-custom ${
                  errors.dob ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.dob && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.dob}</p>
            )}
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-brand-600 disabled:bg-slate-400 py-3 text-sm font-semibold text-white shadow-sm transition-all-custom hover:shadow-brand-500/10 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isEditMode ? 'Save Changes' : 'Register User'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all-custom"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
