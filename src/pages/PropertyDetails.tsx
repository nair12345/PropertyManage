import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, MapPin, Home, DollarSign, User, Plus, X } from 'lucide-react';
import { api, Property, IncomeRecord, ExpenseRecord } from '../api';

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);

  // Form states
  const [incomeForm, setIncomeForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });
  const [expenseForm, setExpenseForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], category: 'Maintenance', vendor: '', description: '' });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id, 10));
    }
  }, [id]);

  const loadData = async (propertyId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load property first
      const propData = await api.getProperty(propertyId);
      setProperty(propData);
      
      // Then try to load financials
      try {
        const [incomeData, expenseData] = await Promise.all([
          api.getIncome(propertyId),
          api.getExpenses(propertyId)
        ]);
        setIncomes(incomeData);
        setExpenses(expenseData);
      } catch (financialErr) {
        console.error('Failed to load financial records:', financialErr);
        // We don't set the main error here so the property details still show
        setRecordError(financialErr instanceof Error ? financialErr.message : 'Failed to load financial records.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load property details.';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!property) return;

    try {
      setIsDeleting(true);
      await api.deleteProperty(property.property_id);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete property.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    
    try {
      setSavingRecord(true);
      setRecordError(null);
      await api.createIncome(property.property_id, {
        amount: parseFloat(incomeForm.amount),
        date: incomeForm.date,
        description: incomeForm.description
      });
      setShowIncomeModal(false);
      setIncomeForm({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });
      // Reload data
      loadData(property.property_id);
    } catch (err) {
      console.error('Failed to add income record:', err);
      setRecordError(err instanceof Error ? err.message : 'Failed to add income record.');
    } finally {
      setSavingRecord(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    
    try {
      setSavingRecord(true);
      setRecordError(null);
      await api.createExpense(property.property_id, {
        amount: parseFloat(expenseForm.amount),
        date: expenseForm.date,
        category: expenseForm.category,
        vendor: expenseForm.vendor,
        description: expenseForm.description
      });
      setShowExpenseModal(false);
      setExpenseForm({ amount: '', date: new Date().toISOString().split('T')[0], category: 'Maintenance', vendor: '', description: '' });
      // Reload data
      loadData(property.property_id);
    } catch (err) {
      console.error('Failed to add expense record:', err);
      setRecordError(err instanceof Error ? err.message : 'Failed to add expense record.');
    } finally {
      setSavingRecord(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-800">{error || 'Property not found'}</h3>
        <Link to="/" className="mt-4 text-blue-600 hover:text-blue-800 inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
        </Link>
      </div>
    );
  }

  const totalIncome = incomes.reduce((sum, f) => sum + f.amount, 0);
  const totalExpense = expenses.reduce((sum, f) => sum + f.amount, 0);
  const netIncome = totalIncome - totalExpense;

  // Combine and sort for the unified list view
  const allFinancials = [
    ...incomes.map(i => ({ ...i, type: 'income' as const, id: i.income_id })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const, id: e.expense_id }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-4 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
          <span className="ml-4 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {property.property_type}
          </span>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/properties/${property.property_id}/edit`}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Edit className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="-ml-1 mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Details Card */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Property Details</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Address</p>
                  <p className="text-sm text-gray-500">
                    {property.address}<br />
                    {property.city}, {property.state} {property.postal_code}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tenant</p>
                  <p className="text-sm text-gray-500">{property.tenant_name || 'Vacant'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Monthly Rent</p>
                  <p className="text-sm text-gray-500">${(property.monthly_rent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financials Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-500 truncate">Total Income</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">${(totalIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-500 truncate">Total Expenses</p>
              <p className="mt-1 text-2xl font-semibold text-red-600">${(totalExpense || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-500 truncate">Net Income</p>
              <p className={`mt-1 text-2xl font-semibold ${netIncome >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                ${(netIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Financial Records List */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Financial Records</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowIncomeModal(true)}
                  className="inline-flex items-center rounded-md border border-transparent bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-200"
                >
                  <Plus className="-ml-1 mr-1 h-4 w-4" />
                  Income
                </button>
                <button 
                  onClick={() => setShowExpenseModal(true)}
                  className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  <Plus className="-ml-1 mr-1 h-4 w-4" />
                  Expense
                </button>
              </div>
            </div>
            
            {recordError && (
              <div className="p-4 bg-red-50 border-b border-red-100 text-sm text-red-600">
                {recordError}
              </div>
            )}
            
            {allFinancials.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No financial records found for this property.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {allFinancials.map((record) => (
                  <li key={`${record.type}-${record.id}`} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {record.description || (record.type === 'expense' ? (record as any).category : 'Income')}
                        </p>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                          {record.type === 'expense' && (record as any).vendor && (
                            <>
                              <span className="mx-2 text-gray-300">•</span>
                              <p className="text-xs text-gray-500">{(record as any).vendor}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                          record.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.type === 'income' ? '+' : '-'}${(record.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Add Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowIncomeModal(false)}></div>
            
            <div className="relative inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Add Income</h3>
                  <button onClick={() => { setShowIncomeModal(false); setRecordError(null); }} className="text-gray-400 hover:text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {recordError && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    {recordError}
                  </div>
                )}
                <form id="income-form" onSubmit={handleAddIncome}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="income-amount" className="block text-sm font-medium text-gray-700">Amount ($)</label>
                      <input type="number" id="income-amount" required step="0.01" min="0" value={incomeForm.amount} onChange={e => setIncomeForm({...incomeForm, amount: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="income-date" className="block text-sm font-medium text-gray-700">Date</label>
                      <input type="date" id="income-date" required value={incomeForm.date} onChange={e => setIncomeForm({...incomeForm, date: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="income-desc" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                      <input type="text" id="income-desc" value={incomeForm.description} onChange={e => setIncomeForm({...incomeForm, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. Rent payment" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="submit" form="income-form" disabled={savingRecord} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                  {savingRecord ? 'Saving...' : 'Save Income'}
                </button>
                <button type="button" onClick={() => setShowIncomeModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowExpenseModal(false)}></div>
            
            <div className="relative inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Add Expense</h3>
                  <button onClick={() => { setShowExpenseModal(false); setRecordError(null); }} className="text-gray-400 hover:text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {recordError && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    {recordError}
                  </div>
                )}
                <form id="expense-form" onSubmit={handleAddExpense}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700">Amount ($)</label>
                      <input type="number" id="expense-amount" required step="0.01" min="0" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="expense-date" className="block text-sm font-medium text-gray-700">Date</label>
                      <input type="date" id="expense-date" required value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="expense-category" className="block text-sm font-medium text-gray-700">Category</label>
                      <select id="expense-category" required value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                        <option value="Maintenance">Maintenance</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Taxes">Taxes</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Management Fee">Management Fee</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="expense-vendor" className="block text-sm font-medium text-gray-700">Vendor (Optional)</label>
                      <input type="text" id="expense-vendor" value={expenseForm.vendor} onChange={e => setExpenseForm({...expenseForm, vendor: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. Bob's Plumbing" />
                    </div>
                    <div>
                      <label htmlFor="expense-desc" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                      <input type="text" id="expense-desc" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. Fixed leaky faucet" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="submit" form="expense-form" disabled={savingRecord} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                  {savingRecord ? 'Saving...' : 'Save Expense'}
                </button>
                <button type="button" onClick={() => setShowExpenseModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
            
            <div className="relative inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Delete Property</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <strong>{property.name}</strong>? All associated financial records will be lost. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Property'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

