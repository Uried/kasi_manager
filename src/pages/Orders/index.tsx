import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import type { Order } from '../../services/orderService';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrders();
      setOrders(response.orders);
      setFilteredOrders(response.orders);
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search term and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = orders.filter(order => {
        const customerName = order.email ? order.email.split('@')[0] : ''; // Extract name from email
        const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      // Nouveaux statuts
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'confirme': return 'bg-blue-100 text-blue-800';
      case 'livre': return 'bg-green-100 text-green-800';
      case 'annule': return 'bg-red-100 text-red-800';
      // Mapping temporaire des anciens statuts
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      // Nouveaux statuts
      case 'en_cours': return 'En cours';
      case 'confirme': return 'Confirmé';
      case 'livre': return 'Livré';
      case 'annule': return 'Annulé';
      // Mapping temporaire des anciens statuts
      case 'pending': return 'En cours';
      case 'confirmed': return 'Confirmé';
      case 'processing': return 'En cours';
      case 'shipped': return 'En cours';
      case 'delivered': return 'Livré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Call the API to update the status
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Update local state only if API call succeeds
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
      // Optionally show an error message to the user
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p style={{ color: '#6b7280' }}>Chargement des commandes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#dc2626', fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <p style={{ color: '#dc2626', fontSize: '18px', marginBottom: '16px' }}>{error}</p>
            <button 
              onClick={fetchOrders}
              style={{ 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '6px', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              Réessayer
            </button>
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
          Gestion des commandes
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Gérez et suivez toutes vos commandes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg" style={{ backgroundColor: '#dbeafe' }}>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2563eb' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{ color: '#4b5563' }}>Total commandes</p>
              <p className="text-2xl font-semibold text-gray-900" style={{ color: '#111827' }}>{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#d97706' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{ color: '#4b5563' }}>En cours</p>
              <p className="text-2xl font-semibold text-gray-900" style={{ color: '#111827' }}>
                {orders.filter(order => order.status === 'en_cours').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg" style={{ backgroundColor: '#dcfce7' }}>
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#16a34a' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{ color: '#4b5563' }}>Livrées</p>
              <p className="text-2xl font-semibold text-gray-900" style={{ color: '#111827' }}>
                {orders.filter(order => order.status === 'livre').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une commande..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db' }}
            >
              <option value="all" style={{ color: '#111827' }}>Tous les statuts</option>
              <option value="pending" style={{ color: '#111827' }}>En cours</option>
              <option value="confirmed" style={{ color: '#111827' }}>Confirmé</option>
              <option value="delivered" style={{ color: '#111827' }}>Livré</option>
              <option value="cancelled" style={{ color: '#111827' }}>Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
        <div className="overflow-x-auto">
          {/* Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '18% 25% 12% 12% 15% 18%',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ padding: '12px 24px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Commande
            </div>
            <div style={{ padding: '12px 24px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Client
            </div>
            <div style={{ padding: '12px 24px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Statut
            </div>
            <div style={{ padding: '12px 24px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total
            </div>
            <div style={{ padding: '12px 24px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Date
            </div>
            <div style={{ padding: '12px 24px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Actions
            </div>
          </div>
          
          {/* Data Rows */}
          <div>
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '18% 25% 12% 12% 15% 18%',
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <div style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{order.orderNumber}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{order.items.length} article(s)</div>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{order.email ? order.email.split('@')[0] : 'N/A'}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{order.email || 'Email non disponible'}</div>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                  {formatPrice(order.total)}
                </div>
                <div style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                  {formatDate(order.createdAt)}
                </div>
                <div style={{ padding: '16px 24px' }}>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="text-blue-600 hover:text-blue-900"
                      style={{ color: '#2563eb' }}
                    >
                      Voir
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                      style={{ backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db' }}
                    >
                      <option value="pending" style={{ color: '#111827' }}>En cours</option>
                      <option value="confirmed" style={{ color: '#111827' }}>Confirmé</option>
                      <option value="delivered" style={{ color: '#111827' }}>Livré</option>
                      <option value="cancelled" style={{ color: '#111827' }}>Annulé</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900" style={{ color: '#111827' }}>
                  Détail de la commande {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  style={{ color: '#9ca3af' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#9ca3af' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: '#111827', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Informations client</h3>
                  <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                    <p style={{ color: '#374151', marginBottom: '8px' }}><strong>Email:</strong> {selectedOrder.email}</p>
                    <p style={{ color: '#374151', marginBottom: '8px' }}><strong>Téléphone:</strong> {selectedOrder.phone}</p>
                    <p style={{ color: '#374151', marginBottom: '8px' }}><strong>Adresse:</strong> {selectedOrder.shippingAddress}</p>
                    {selectedOrder.notes && <p style={{ color: '#374151', marginBottom: '0' }}><strong>Notes:</strong> {selectedOrder.notes}</p>}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3" style={{ color: '#111827' }}>Articles commandés</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={`${item.productId}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {item.image && (
                            <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          )}
                          <div>
                            <p style={{ color: '#111827', fontWeight: '500', margin: '0 0 4px 0' }}>{item.name}</p>
                            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 2px 0' }}>{item.brand} - {item.variant}</p>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>Quantité: {item.quantity}</p>
                          </div>
                        </div>
                        <p style={{ color: '#111827', fontWeight: '600', margin: '0' }}>{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold" style={{ color: '#111827' }}>Total:</span>
                    <span className="text-xl font-bold text-blue-600" style={{ color: '#2563eb' }}>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Order Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3" style={{ color: '#111827' }}>Statut de la commande</h3>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                    <div className="text-sm text-gray-500">
                      <p style={{ color: '#6b7280' }}>Créée le: {formatDate(selectedOrder.createdAt)}</p>
                      <p style={{ color: '#6b7280' }}>Mise à jour: {formatDate(selectedOrder.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
