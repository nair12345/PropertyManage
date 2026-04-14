import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Home, DollarSign, User, Search, X } from 'lucide-react';
import { api, Property } from '../api';

export default function PropertiesList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'city' | 'state' | 'postal' | 'tenant'>('all');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await api.getProperties();
      setProperties(data);
      setError(null);
      setSearchQuery('');
      setSearchType('all');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load properties.';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadProperties();
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      let results: Property[] = [];

      switch (searchType) {
        case 'city':
          results = await api.searchPropertiesByCity(searchQuery);
          break;
        case 'state':
          results = await api.searchPropertiesByState(searchQuery);
          break;
        case 'postal':
          results = await api.searchPropertiesByPostalCode(searchQuery);
          break;
        case 'tenant':
          results = await api.searchPropertiesByTenant(searchQuery);
          break;
        default:
          // If 'all' is selected but query is present, we might want to do a client-side filter 
          // or just default to one of the searches. For now, let's just reload all if 'all' is picked.
          loadProperties();
          return;
      }
      setProperties(results);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    loadProperties();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the properties in your portfolio.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/properties/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-shrink-0">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 bg-gray-50 px-3"
            >
              <option value="all">All Properties</option>
              <option value="city">Search by City</option>
              <option value="state">Search by State</option>
              <option value="postal">Search by Zip</option>
              <option value="tenant">Search by Tenant</option>
            </select>
          </div>
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchType === 'all' ? "Select a filter to search..." : `Enter ${searchType}...`}
              disabled={searchType === 'all'}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching || searchType === 'all'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 h-10"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
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

      {properties.length === 0 && !error ? (
        <div className="text-center bg-white rounded-lg shadow px-6 py-12 border border-gray-200">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new property.</p>
          <div className="mt-6">
            <Link
              to="/properties/new"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              New Property
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Link
              key={property.property_id}
              to={`/properties/${property.property_id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                    {property.name}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    {property.property_type}
                  </span>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-start text-sm text-gray-500">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
                    <span className="line-clamp-2">
                      {property.address}<br />
                      {property.city}, {property.state} {property.postal_code}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{property.tenant_name || 'Vacant'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <DollarSign className="mr-1 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>{(property.monthly_rent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} / mo</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
