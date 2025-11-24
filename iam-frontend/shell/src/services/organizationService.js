const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export const organizationService = {
  // Get all parent organizations
  getAllOrganizations: async () => {
    const response = await fetch(`${API_BASE_URL}/api/organizations`);
    if (!response.ok) throw new Error('Failed to fetch organizations');
    return response.json();
  },

  // Get organization by ID
  getOrganizationById: async (orgId) => {
    const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}`);
    if (!response.ok) throw new Error('Failed to fetch organization');
    return response.json();
  },

  // Get child organizations
  getChildOrganizations: async (parentId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/organizations?parentId=${parentId}`
    );
    if (!response.ok) throw new Error('Failed to fetch child organizations');
    return response.json();
  },

  // Get organization hierarchy
  getOrganizationHierarchy: async (orgId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/organizations/${orgId}/hierarchy`
    );
    if (!response.ok) throw new Error('Failed to fetch hierarchy');
    return response.json();
  },

  // Create organization
  createOrganization: async (orgData) => {
    const response = await fetch(`${API_BASE_URL}/api/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orgData),
    });
    if (!response.ok) throw new Error('Failed to create organization');
    return response.json();
  },

  // Update organization
  updateOrganization: async (orgId, orgData) => {
    const response = await fetch(
      `${API_BASE_URL}/api/organizations/${orgId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData),
      }
    );
    if (!response.ok) throw new Error('Failed to update organization');
    return response.json();
  },

  // Delete organization
  deleteOrganization: async (orgId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/organizations/${orgId}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Failed to delete organization');
    return response.text();
  },

  // Filter organizations by location
  filterByLocation: async (filters) => {
    const params = new URLSearchParams();
    if (filters.region) params.append('region', filters.region);
    if (filters.country) params.append('country', filters.country);
    if (filters.state) params.append('state', filters.state);
    if (filters.city) params.append('city', filters.city);

    const response = await fetch(
      `${API_BASE_URL}/api/organizations/filter?${params}`
    );
    if (!response.ok) throw new Error('Failed to filter organizations');
    return response.json();
  },
};