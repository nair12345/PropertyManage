/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import PropertiesList from './pages/PropertiesList';
import PropertyDetails from './pages/PropertyDetails';
import PropertyForm from './pages/PropertyForm';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <span className="font-bold text-xl tracking-tight text-gray-900">
                    PropManage
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<PropertiesList />} />
            <Route path="/properties/new" element={<PropertyForm />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/properties/:id/edit" element={<PropertyForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

