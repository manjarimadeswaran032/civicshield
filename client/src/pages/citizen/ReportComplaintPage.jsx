import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, MapPin, Upload, Camera, AlertTriangle, CheckCircle, Navigation, Shield } from 'lucide-react';
import { api } from '../../services/api';

export const ReportComplaintPage = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    address: '',
    landmark: '',
    city: 'Metro City',
    postalCode: '',
    latitude: '',
    longitude: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get('/admin/categories');
        if (data.success && data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setFormData(prev => ({ ...prev, category: data.categories[0].name }));
          }
        }
      } catch (e) {
        // fallback
        setCategories([
          { name: 'Pothole & Road Damage', defaultPriority: 'High', defaultSlaHours: 48 },
          { name: 'Streetlight Malfunction', defaultPriority: 'Medium', defaultSlaHours: 72 },
          { name: 'Overflowing Waste Bins', defaultPriority: 'High', defaultSlaHours: 24 },
          { name: 'Water Pipeline Leakage', defaultPriority: 'Critical', defaultSlaHours: 12 },
          { name: 'Blocked Drainage & Sewage', defaultPriority: 'High', defaultSlaHours: 36 }
        ]);
        setFormData(prev => ({ ...prev, category: 'Pothole & Road Damage' }));
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto update default priority if category changes
    if (name === 'category') {
      const selected = categories.find(c => c.name === value);
      if (selected?.defaultPriority) {
        setFormData(prev => ({ ...prev, priority: selected.defaultPriority }));
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          landmark: prev.landmark || 'GPS Autofilled Coordinates'
        }));
        setGpsLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location: ' + err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const body = new FormData();
      Object.keys(formData).forEach(key => {
        body.append(key, formData[key]);
      });

      if (imageFile) {
        body.append('image', imageFile);
      }

      const data = await api.post('/complaints', body);
      if (data.success && data.complaint) {
        navigate(`/citizen/complaints/${data.complaint.complaintId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Report a Civic Problem</h1>
        <p className="text-xs text-slate-500">Provide accurate details and photos for prompt municipal field team response</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Issue Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                {categories.map((c, i) => (
                  <option key={i} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Priority Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="Low">Low (Standard Non-Urgent)</option>
                <option value="Medium">Medium (Regular Maintenance)</option>
                <option value="High">High (High Public Impact)</option>
                <option value="Critical">Critical (Immediate Danger / Rupture)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Complaint Title *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g., Deep pothole causing skidding on MG Road right lane"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Detailed Description *</label>
            <textarea
              name="description"
              required
              rows="4"
              placeholder="Describe the severity, duration, and exact surrounding landmarks..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Photo Evidence (Max 5MB)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl transition bg-slate-50/50">
              {imagePreview ? (
                <div className="text-center space-y-3">
                  <img src={imagePreview} alt="Preview" className="max-h-48 rounded-xl mx-auto shadow-sm" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Remove and Choose Another
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Camera className="mx-auto h-10 w-10 text-slate-400" />
                  <div className="flex text-xs text-slate-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-bold text-brand-600 hover:text-brand-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-[10px] text-slate-400">PNG, JPG, WebP up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Location & Geo Coordinates *</label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gpsLoading}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg transition border border-brand-200"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{gpsLoading ? 'Detecting GPS...' : 'Use My GPS Location'}</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                name="address"
                required
                placeholder="Street address / Landmark location (e.g. Opposite Gate 2, Metro Station)"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="latitude"
                placeholder="Latitude (e.g. 28.6139)"
                value={formData.latitude}
                onChange={handleChange}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="text"
                name="longitude"
                placeholder="Longitude (e.g. 77.2090)"
                value={formData.longitude}
                onChange={handleChange}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-brand-500/25 flex items-center justify-center space-x-2"
            >
              {submitting ? <span>Logging Complaint & Calculating SLA...</span> : <span>Submit Complaint to Municipal Portal</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
