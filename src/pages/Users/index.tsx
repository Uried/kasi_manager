import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Load current user and fetch users from API
  useEffect(() => {
    // Load current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des utilisateurs');
        }

        const usersData: User[] = await response.json();
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to mock data in case of error
        const mockUsers: User[] = [
          {
            id: '1',
            fullName: 'Admin Principal',
            email: 'admin@kasi-manager.com',
            role: 'admin',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            fullName: 'Marie Dupont',
            email: 'marie.dupont@kasi-manager.com',
            role: 'user',
            isActive: true,
            createdAt: '2024-03-15T00:00:00Z',
            updatedAt: '2024-03-15T00:00:00Z'
          },
          {
            id: '3',
            fullName: 'Jean Martin',
            email: 'jean.martin@kasi-manager.com',
            role: 'user',
            isActive: false,
            createdAt: '2024-06-10T00:00:00Z',
            updatedAt: '2024-06-10T00:00:00Z'
          }
        ];
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [API_BASE_URL]);

  // Filter users based on search term, role, and status
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.isActive === (statusFilter === 'active'));
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Administrateur';
      case 'admin': return 'Administrateur';
      case 'user': return 'Utilisateur';
      default: return role;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Actif' : 'Inactif';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const user = users.find(u => u.id === userId);
      
      if (!user) return;
      
      const endpoint = user.isActive 
        ? `${API_BASE_URL}/api/users/${userId}/deactivate`
        : `${API_BASE_URL}/api/users/${userId}/activate`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du statut utilisateur');
      }

      // Mettre à jour l'état local après succès de l'API
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId
            ? { ...u, isActive: !u.isActive }
            : u
        )
      );
    } catch (error) {
      console.error('Error toggling user status:', error);
      // Optionnel: afficher un message d'erreur à l'utilisateur
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p style={{ color: '#6b7280' }}>Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Gestion des utilisateurs
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Gérez les comptes utilisateurs et leurs permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginBottom: '32px' }}>
        <div className="bg-white p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg" style={{ backgroundColor: '#dbeafe' }}>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2563eb' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{ color: '#4b5563' }}>Total utilisateurs</p>
              <p className="text-2xl font-semibold text-gray-900" style={{ color: '#111827' }}>{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg" style={{ backgroundColor: '#dcfce7' }}>
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#16a34a' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{ color: '#4b5563' }}>Utilisateurs actifs</p>
              <p className="text-2xl font-semibold text-gray-900" style={{ color: '#111827' }}>
                {users.filter(user => user.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg" style={{ backgroundColor: '#fee2e2' }}>
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#dc2626' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{ color: '#4b5563' }}>Administrateurs</p>
              <p className="text-2xl font-semibold text-gray-900" style={{ color: '#111827' }}>
                {users.filter(user => user.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', marginBottom: '32px' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db' }}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#9ca3af' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db' }}
            >
              <option value="all">Tous les rôles</option>
              <option value="super_admin">Super Administrateur</option>
              <option value="admin">Administrateur</option>
              <option value="user">Utilisateur</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db' }}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>

          {currentUser?.role === 'super_admin' && (
            <button
              onClick={() => navigate('/users/add')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: '#2563eb' }}
            >
              Ajouter un administrateur
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
        <div className="overflow-x-auto">
          {/* Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '25% 25% 15% 15% 20%',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ padding: '12px 24px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Utilisateur
            </div>
            <div style={{ padding: '12px 24px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
            </div>
            <div style={{ padding: '12px 24px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Rôle
            </div>
            <div style={{ padding: '12px 24px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Statut
            </div>
            <div style={{ padding: '12px 24px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Actions
            </div>
          </div>
          
          {/* Data Rows */}
          <div>
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '25% 25% 15% 15% 20%',
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <div style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{user.fullName}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Créé le {formatDate(user.createdAt)}</div>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '14px', color: '#111827' }}>{user.email}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Mis à jour: {formatDate(user.updatedAt)}</div>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                    {getStatusText(user.isActive)}
                  </span>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  {currentUser?.role === 'super_admin' && user.role === 'admin' && (
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`text-sm ${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      style={{ color: user.isActive ? '#dc2626' : '#16a34a' }}
                    >
                      {user.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
