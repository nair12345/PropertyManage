import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { api, Property } from '../api';

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Property, 'property_id'>>({
    name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    property_type: 'Single-Family',
    tenant_name: '',
    monthly_rent: 0,
  });

  useEffect(() => {
    if (isEditing && id) {
      loadProperty(parseInt(id, 10));
    }
  }, [id, isEditing]);

  const loadProperty = async (propertyId: number) => {
    try {
      setLoading(true);
      const data = await api.getProperty(propertyId);
      setFormData({
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        property_type: data.property_type,
        tenant_name: data.tenant_name,
        monthly_rent: data.monthly_rent,
      });
    } catch (err) {
      setError('Failed to load property details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'monthly_rent' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      if (isEditing && id) {
        await api.updateProperty(parseInt(id, 10), formData);
        navigate(`/properties/${id}`);
      } else {
        const newProperty = await api.createProperty(formData);
        navigate(`/properties/${newProperty.property_id}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save property. Please check your inputs and try again.';
      setError(msg);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link
          to={isEditing ? `/properties/${id}` : '/'}
          className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Property' : 'Add New Property'}
        </h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Property Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                  placeholder="e.g. Sunnyvale Apartment"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="address"
                  id="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="city"
                  id="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="state"
                  id="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                ZIP / Postal Code
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="postal_code"
                  id="postal_code"
                  required
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">
                Property Type
              </label>
              <div className="mt-1">
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2 bg-white"
                >
                  <option value="Single-Family">Single-Family</option>
                  <option value="Multi-Family">Multi-Family</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhome">Townhome</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700">
                Monthly Rent ($)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="monthly_rent"
                  id="monthly_rent"
                  required
                  min="0"
                  step="0.01"
                  value={formData.monthly_rent}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="tenant_name" className="block text-sm font-medium text-gray-700">
                Tenant Name (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="tenant_name"
                  id="tenant_name"
                  value={formData.tenant_name}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200 flex justify-end gap-3">
            <Link
              to={isEditing ? `/properties/${id}` : '/'}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed items-center"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? 'Save Changes' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
