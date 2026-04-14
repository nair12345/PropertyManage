export const API_BASE_URL = 'https://prop-mgmt-backend-git-1096977754973.us-central1.run.app';

export interface Property {
  property_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  property_type: string;
  tenant_name: string;
  monthly_rent: number;
}

export interface IncomeRecord {
  income_id?: number;
  property_id: number;
  amount: number;
  date: string;
  description?: string;
}

export interface ExpenseRecord {
  expense_id?: number;
  property_id: number;
  amount: number;
  date: string;
  category: string;
  vendor?: string;
  description?: string;
}

export const api = {
  async getProperties(): Promise<Property[]> {
    const res = await fetch(`${API_BASE_URL}/properties`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch properties: ${res.status} ${errorText}`);
    }
    return res.json();
  },

  async getProperty(id: number): Promise<Property> {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch property: ${res.status} ${errorText}`);
    }
    return res.json();
  },

  async createProperty(data: Omit<Property, 'property_id'>): Promise<Property> {
    const res = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend error response:', errorText);
      if (res.status === 404) {
        throw new Error('Endpoint not found (404). Please ensure the backend code is deployed and the URL is correct.');
      }
      throw new Error(`Failed to create property: ${res.status} ${errorText}`);
    }
    return res.json();
  },

  async updateProperty(id: number, data: Partial<Property>): Promise<Property> {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend error response:', errorText);
      if (res.status === 404) {
        throw new Error('Endpoint not found (404). Please ensure the backend code is deployed and the URL is correct.');
      }
      throw new Error(`Failed to update property: ${res.status} ${errorText}`);
    }
    return res.json();
  },

  async deleteProperty(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete property');
  },

  async searchPropertiesByCity(city: string): Promise<Property[]> {
    const res = await fetch(`${API_BASE_URL}/properties/city/${encodeURIComponent(city)}`);
    if (!res.ok) return []; // Return empty if not found or error
    return res.json();
  },

  async searchPropertiesByState(state: string): Promise<Property[]> {
    const res = await fetch(`${API_BASE_URL}/properties/state/${encodeURIComponent(state)}`);
    if (!res.ok) return [];
    return res.json();
  },

  async searchPropertiesByPostalCode(postalCode: string): Promise<Property[]> {
    const res = await fetch(`${API_BASE_URL}/properties/postal/${encodeURIComponent(postalCode)}`);
    if (!res.ok) return [];
    return res.json();
  },

  async searchPropertiesByTenant(tenantName: string): Promise<Property[]> {
    const res = await fetch(`${API_BASE_URL}/properties/tenant/${encodeURIComponent(tenantName)}`);
    if (!res.ok) return [];
    return res.json();
  },

  async getIncome(propertyId: number): Promise<IncomeRecord[]> {
    const res = await fetch(`${API_BASE_URL}/income/${propertyId}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch income: ${res.status} ${errorText}`);
    }
    return res.json();
  },

  async createIncome(propertyId: number, data: Omit<IncomeRecord, 'income_id' | 'property_id'>): Promise<void> {
    // Generate a unique ID since the backend/BigQuery requires it and might not be auto-generating it
    // Use a smaller number to avoid potential 32-bit integer overflow issues
    const income_id = Math.floor(Math.random() * 1000000);
    const res = await fetch(`${API_BASE_URL}/income/${propertyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, income_id, id: income_id }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create income record: ${res.status} ${errorText}`);
    }
  },

  async getExpenses(propertyId: number): Promise<ExpenseRecord[]> {
    const res = await fetch(`${API_BASE_URL}/expenses/${propertyId}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch expenses: ${res.status} ${errorText}`);
    }
    return res.json();
  },

  async createExpense(propertyId: number, data: Omit<ExpenseRecord, 'expense_id' | 'property_id'>): Promise<void> {
    // Generate a unique ID since the backend/BigQuery requires it and might not be auto-generating it
    // Use a smaller number to avoid potential 32-bit integer overflow issues
    const expense_id = Math.floor(Math.random() * 1000000);
    const res = await fetch(`${API_BASE_URL}/expenses/${propertyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, expense_id, id: expense_id }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create expense record: ${res.status} ${errorText}`);
    }
  }
};
