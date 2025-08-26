import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Link as RouterLink } from '../components/shared/RouterLink';
import kasiLogo from '../assets/images/kasi-logo.png';

interface SidebarItem {
  title: string;
  path: string;
  icon: string;
  subItems?: { title: string; path: string }[];
}

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string>('/dashboard'); // Default active item
  const [pageTitle, setPageTitle] = useState<string>('Dashboard');
  const location = useLocation();

  const sidebarItems: SidebarItem[] = [
    {
      title: 'Tableau de bord',
      path: '',
      icon: 'chart-pie',
    },
    {
      title: 'Gestion des produits',
      path: '/products',
      icon: 'shopping-bag',
      subItems: [
        { title: 'Liste des produits', path: '/products' },
        { title: 'Ajout de produit', path: '/products/add' },
        { title: 'Gestion des stocks', path: '/products/inventory' }
        // { title: 'Import/Export CSV', path: '/products/import-export' },
        // { title: 'Attributs de produits', path: '/products/attributes' },
      ],
    },
    {
      title: 'Gestion des catégories',
      path: '/categories',
      icon: 'folder',
      subItems: [
        { title: 'Liste des catégories', path: '/categories' },
        { title: 'Création de catégorie', path: '/categories/add' },
      ],
    },
    // {
    //   title: 'Gestion des commandes',
    //   path: '/orders',
    //   icon: 'shopping-cart',
    //   subItems: [
    //     { title: 'Liste des commandes', path: '/orders' },
    //     { title: 'Détail des commandes', path: '/orders/details' },
    //     { title: 'Suivi WhatsApp', path: '/orders/whatsapp' },
    //     { title: 'Bons de livraison', path: '/orders/delivery' },
    //   ],
    // },
    // {
    //   title: 'Gestion des clients',
    //   path: '/customers',
    //   icon: 'users',
    //   subItems: [
    //     { title: 'Liste des clients', path: '/customers' },
    //     { title: 'Fiches clients', path: '/customers/details' },
    //     { title: 'Historique des commandes', path: '/customers/orders' },
    //     { title: 'Segmentation client', path: '/customers/segments' },
    //   ],
    // },
    {
      title: 'Médiathèque',
      path: '/media',
      icon: 'photo-video',
      subItems: [
        { title: 'Bibliothèque d\'images', path: '/media/images' },
        // { title: 'Bibliothèque vidéo', path: '/media/videos' },
        // { title: 'Documents', path: '/media/documents' },
      ],
    },
    // {
    //   title: 'Marketing',
    //   path: '/marketing',
    //   icon: 'bullhorn',
    //   subItems: [
    //     { title: 'Promotions', path: '/marketing/promotions' },
    //     { title: 'Codes promo', path: '/marketing/promo-codes' },
    //     { title: 'Produits mis en avant', path: '/marketing/featured' },
    //     { title: 'Bannières publicitaires', path: '/marketing/banners' },
    //     { title: 'Notifications push', path: '/marketing/notifications' },
    //   ],
    // },
    // {
    //   title: 'Contenu',
    //   path: '/content',
    //   icon: 'file-alt',
    //   subItems: [
    //     { title: 'Pages statiques', path: '/content/pages' },
    //     { title: 'Blog/Actualités', path: '/content/blog' },
    //     { title: 'FAQ', path: '/content/faq' },
    //     { title: 'Conditions générales', path: '/content/terms' },
    //     { title: 'Politique de confidentialité', path: '/content/privacy' },
    //   ],
    // },
    // {
    //   title: 'Configuration',
    //   path: '/configuration',
    //   icon: 'cog',
    //   subItems: [
    //     { title: 'Paramètres généraux', path: '/configuration/general' },
    //     { title: 'Moyens de paiement', path: '/configuration/payment' },
    //     { title: 'Options de livraison', path: '/configuration/shipping' },
    //     { title: 'Taxes et frais', path: '/configuration/taxes' },
    //     { title: 'Emails automatiques', path: '/configuration/emails' },
    //     { title: 'Numéro WhatsApp', path: '/configuration/whatsapp' },
    //   ],
    // },
    // {
    //   title: 'Rapports et analyses',
    //   path: '/reports',
    //   icon: 'chart-line',
    //   subItems: [
    //     { title: 'Rapports de ventes', path: '/reports/sales' },
    //     { title: 'Statistiques produits', path: '/reports/products' },
    //     { title: 'Comportement utilisateur', path: '/reports/users' },
    //     { title: 'Performances marketing', path: '/reports/marketing' },
    //     { title: 'Exportation de données', path: '/reports/export' },
    //   ],
    // },
    // {
    //   title: 'Gestion des utilisateurs',
    //   path: '/users',
    //   icon: 'user-shield',
    //   subItems: [
    //     { title: 'Comptes administrateurs', path: '/users/admins' },
    //     { title: 'Rôles et permissions', path: '/users/roles' },
    //     { title: 'Journal d\'activité', path: '/users/activity' },
    //     { title: 'Sécurité et accès', path: '/users/security' },
    //   ],
    // },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSubmenu = (title: string) => {
    if (openSubmenu === title) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(title);
    }
  };

  const handleMenuClick = (path: string, title?: string) => {
    setActiveItem(path);
    if (title) {
      setPageTitle(title);
    }
  };
  
  // Mettre à jour le titre de la page en fonction de l'URL actuelle
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Trouver l'élément de menu correspondant à l'URL actuelle
    for (const item of sidebarItems) {
      if (item.subItems) {
        for (const subItem of item.subItems) {
          if (subItem.path === currentPath) {
            setPageTitle(subItem.title);
            setActiveItem(currentPath);
            setOpenSubmenu(item.title);
            return;
          }
        }
      } else if (item.path === currentPath) {
        setPageTitle(item.title);
        setActiveItem(currentPath);
        return;
      }
    }
    
    // Cas spéciaux pour les redirections
    if (currentPath === '/media') {
      setPageTitle('Médiathèque');
      setActiveItem('/media/images');
      setOpenSubmenu('Médiathèque');
    }
  }, [location.pathname]);

  // Function to return the appropriate SVG path based on icon name
  const getIconPath = (icon: string) => {
    switch (icon) {
      case 'chart-pie':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
          />
        );
      case 'shopping-bag':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        );
      case 'folder':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        );
      case 'shopping-cart':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        );
      case 'users':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        );
      case 'bullhorn':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        );
      case 'file-alt':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        );
      case 'cog':
        return (
          <>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </>
        );
      case 'chart-line':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        );
      case 'user-shield':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9a3 3 0 100-6 3 3 0 000 6z"
          />
        );
      case 'photo-video':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        );
      default:
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden fixed inset-0">
      {/* Sidebar */}
      <div
        className={`bg-[#1a2156] text-white transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } min-h-screen rounded-tr-3xl rounded-br-3xl`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen ? (
            <img src={kasiLogo} alt="Kasi Manager Logo" className="h-32 mt-2 mb-4" />
          ) : (
            <img src={kasiLogo} alt="Kasi Manager Logo" className="h-10 w-10 my-2" />
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-10 focus:outline-none"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              )}
            </svg>
          </button>
        </div>
        <nav className="mt-6 px-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.title} className="mb-1">
                {item.subItems ? (
                  <div className="w-full">
                    <button
                      onClick={() => toggleSubmenu(item.title)}
                      className={`flex items-center w-full py-1.5 px-3 rounded-lg transition-colors ${openSubmenu === item.title || activeItem === item.path ? 'bg-white bg-opacity-20 text-white border-l-4 border-blue-400' : 'text-gray-100 hover:bg-white hover:bg-opacity-5 hover:text-white'}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${isSidebarOpen ? 'mr-4' : 'mx-auto'} text-blue-100 opacity-80`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {getIconPath(item.icon)}
                      </svg>
                      {isSidebarOpen && (
                        <>
                          <span className="flex-1 text-left text-xs font-medium">{item.title}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={openSubmenu === item.title ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'}
                            />
                          </svg>
                        </>
                      )}
                    </button>
                    {openSubmenu === item.title && isSidebarOpen && (
                      <ul className="pl-8 mt-1 space-y-0.5">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.title}>
                            <RouterLink
                              to={subItem.path}
                              className={`flex items-center py-1.5 px-2 text-xs rounded-md transition-colors ${activeItem === subItem.path ? 'bg-white bg-opacity-20 text-white border-l-2 border-blue-400' : 'text-gray-300 hover:bg-white hover:bg-opacity-5 hover:text-white'}`}
                              onClick={() => handleMenuClick(subItem.path, subItem.title)}
                            >
                              <span>{subItem.title}</span>
                            </RouterLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <RouterLink
                    to={item.path}
                    className={`flex items-center py-1.5 px-3 rounded-lg transition-colors ${activeItem === item.path ? 'bg-white bg-opacity-20 text-white border-l-4 border-blue-400' : 'text-gray-100 hover:bg-white hover:bg-opacity-5 hover:text-white'}`}
                    onClick={() => handleMenuClick(item.path, item.title)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${isSidebarOpen ? 'mr-4' : 'mx-auto'} text-blue-100 opacity-80`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {getIconPath(item.icon)}
                    </svg>
                    {isSidebarOpen && <span className="text-xs font-medium">{item.title}</span>}
                  </RouterLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 w-full rounded-tl-xl ml-2 mt-2 border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium text-gray-700">{pageTitle}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-1 rounded-full hover:bg-gray-100 focus:outline-none">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <div className="relative">
                <div className="flex items-center space-x-2 text-black border border-gray-300 rounded-md py-2 px-4 focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-gray-200 border flex items-center justify-center text-gray-700">
                    <span className="text-sm font-medium">A</span>
                  </div>
                  <span className="hidden md:block">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 ml-2 mr-2 mb-2 rounded-bl-xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
