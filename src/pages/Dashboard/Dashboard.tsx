

// Mock data for dashboard
const recentSales = [
  { id: 1, product: 'Parfum Élégance', price: 89.99, customer: 'Marie Dupont', date: '12 Août 2025' },
  { id: 2, product: 'Eau de Cologne Fraîcheur', price: 59.99, customer: 'Jean Martin', date: '11 Août 2025' },
  { id: 3, product: 'Parfum Intense Nuit', price: 120.00, customer: 'Sophie Bernard', date: '10 Août 2025' },
  { id: 4, product: 'Eau de Toilette Citron', price: 45.50, customer: 'Thomas Petit', date: '09 Août 2025' },
];

const pendingOrders = [
  { id: 'CMD-2587', customer: 'Lucie Moreau', total: 145.99, status: 'En attente', date: '12 Août 2025' },
  { id: 'CMD-2586', customer: 'Pierre Dubois', total: 89.50, status: 'En attente', date: '12 Août 2025' },
  { id: 'CMD-2585', customer: 'Camille Leroy', total: 210.75, status: 'En préparation', date: '11 Août 2025' },
  { id: 'CMD-2584', customer: 'Antoine Girard', total: 67.25, status: 'En préparation', date: '11 Août 2025' },
];

const lowStockProducts = [
  { id: 1, name: 'Parfum Élégance 50ml', stock: 3, threshold: 5 },
  { id: 2, name: 'Eau de Cologne Fraîcheur 100ml', stock: 2, threshold: 10 },
  { id: 3, name: 'Parfum Intense Nuit 30ml', stock: 4, threshold: 5 },
  { id: 4, name: 'Coffret Découverte', stock: 1, threshold: 3 },
];

const recentActivities = [
  { id: 1, action: 'Nouvelle commande', details: 'CMD-2587 par Lucie Moreau', time: 'Il y a 10 minutes' },
  { id: 2, action: 'Produit ajouté', details: 'Parfum Élégance Intense 75ml', time: 'Il y a 45 minutes' },
  { id: 3, action: 'Commande expédiée', details: 'CMD-2583 vers Paris', time: 'Il y a 1 heure' },
  { id: 4, action: 'Nouveau client', details: 'Antoine Girard s\'est inscrit', time: 'Il y a 2 heures' },
  { id: 5, action: 'Stock mis à jour', details: 'Eau de Cologne Fraîcheur +15', time: 'Il y a 3 heures' },
];

// Stats cards data
const statsCards = [
  { title: 'Ventes du jour', value: '1,245 €', change: '+12%', trend: 'up' },
  { title: 'Commandes du jour', value: '24', change: '+8%', trend: 'up' },
  { title: 'Nouveaux clients', value: '12', change: '+5%', trend: 'up' },
  { title: 'Taux de conversion', value: '3.2%', change: '-0.5%', trend: 'down' },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500">{card.title}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                card.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {card.change}
              </span>
            </div>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Ventes récentes</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Graphique des ventes récentes</p>
            {/* Chart component would go here */}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Performance des produits</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Graphique de performance des produits</p>
            {/* Chart component would go here */}
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Ventes récentes</h2>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Voir tout
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.price.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout for Pending Orders and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Commandes en attente</h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Voir tout
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.total.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'En attente' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Produits en rupture de stock</h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Voir tout
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock actuel
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seuil d'alerte
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.threshold}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-800">Activité récente</h2>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.details}</p>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
