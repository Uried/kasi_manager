import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      const result: LoginResponse = await response.json();
      
      // Vérifier que l'utilisateur est un administrateur ou super_admin ET actif
      if (result.user.role !== 'admin' && result.user.role !== 'super_admin') {
        throw new Error('Accès refusé. Seuls les administrateurs peuvent se connecter.');
      }
      
      if (!result.user.isActive) {
        throw new Error('Accès refusé. Votre compte administrateur est désactivé.');
      }

      // Stocker le token et les informations utilisateur
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Rediriger vers les produits
      navigate('/products');
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-50 grid grid-cols-2 overflow-hidden fixed inset-0">
      {/* Left Side - Branding */}
      <div className="bg-gradient-to-br from-slate-800 to-blue-600 h-screen flex flex-col items-center justify-center text-white px-10 py-15">
        <div className="text-center max-w-lg">
          <div className="w-30 h-30 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border-2 border-white/20">
            <img 
              src={logo} 
              alt="Kasi Manager Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4 drop-shadow-sm">
            Kasi Manager
          </h1>
          <div className="bg-white/10 hidden rounded-2xl p-6 backdrop-blur-sm border border-white/20">
            <h3 className="text-lg font-semibold mb-4">
              Fonctionnalités principales
            </h3>
            <ul className="list-none p-0 m-0 text-left">
              <li className="py-2 flex items-center">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="mr-3">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Gestion des produits et inventaire
              </li>
              <li className="py-2 flex items-center">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="mr-3">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Suivi des commandes et livraisons
              </li>
              <li className="py-2 flex items-center">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="mr-3">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Gestion des utilisateurs
              </li>
              <li className="py-2 flex items-center">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="mr-3">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Médiathèque et ressources
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="px-20 py-15 flex items-center justify-center h-screen">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Connexion
            </h2>
            <p className="text-gray-500 text-base">
              Accédez à votre espace administrateur
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-200">
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-600 rounded-xl p-4 mb-6 flex items-center">
                <svg width="20" height="20" fill="none" stroke="#dc2626" viewBox="0 0 24 24" className="mr-3 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-600 font-medium">
                  {error}
                </span>
              </div>
            )}

            {/* Email */}
            <div className="mb-6">
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold text-slate-800 mb-3 tracking-wide"
              >
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="votre.email@exemple.com"
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base bg-white text-gray-900 outline-none transition-all duration-300 shadow-sm focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10"
              />
            </div>

            {/* Password */}
            <div className="mb-8">
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-slate-800 mb-3 tracking-wide"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-5 py-4 pr-14 border-2 border-gray-200 rounded-xl text-base bg-white text-gray-900 outline-none transition-all duration-300 shadow-sm focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-800 p-2 rounded-md transition-all duration-200 hover:bg-slate-800/10"
                >
                  {showPassword ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-8 py-4 border-none rounded-xl text-base font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg tracking-wide ${
                loading 
                  ? 'bg-gradient-to-br from-blue-300 to-blue-200 cursor-not-allowed' 
                  : 'bg-gradient-to-br from-slate-800 to-blue-600 cursor-pointer hover:-translate-y-0.5 hover:shadow-xl'
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm m-0">
              Accès réservé aux administrateurs uniquement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
