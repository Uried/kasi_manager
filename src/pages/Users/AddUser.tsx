import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

interface AddUserForm {
  email: string;
  password: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AddUserForm>({
    email: '',
    password: '',
    fullName: '',
    role: 'admin',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'utilisateur');
      }

      const result = await response.json();
      console.log('User created successfully:', result);
      
      setSuccess(true);
      
      // Navigate back to users list after a short delay
      setTimeout(() => {
        navigate('/users');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            marginBottom: '24px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '20px'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '2px solid #e5e7eb'
              }}>
                <img 
                  src={logo} 
                  alt="Kasi Manager Logo" 
                  style={{
                    width: '70px',
                    height: '70px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#1a2156', 
              margin: '0',
              marginBottom: '8px'
            }}>
              Kasi Manager
            </h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '18px',
              margin: '0',
              fontWeight: '500'
            }}>
              Ajouter un nouvel administrateur
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '20px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '40px',
          border: '1px solid #e5e7eb'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Success Message */}
            {success && (
              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #16a34a',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <svg width="20" height="20" fill="none" stroke="#16a34a" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ color: '#16a34a', fontWeight: '500' }}>
                  Administrateur créé avec succès ! Redirection en cours...
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #dc2626',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <svg width="20" height="20" fill="none" stroke="#dc2626" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span style={{ color: '#dc2626', fontWeight: '500' }}>
                  {error}
                </span>
              </div>
            )}

            {/* Full Name */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                htmlFor="fullName" 
                style={{ 
                  display: 'block', 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: '#1a2156', 
                  marginBottom: '12px',
                  letterSpacing: '0.025em'
                }}
              >
                Nom complet *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="Entrez le nom complet"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a2156';
                  e.target.style.boxShadow = '0 0 0 3px rgba(26, 33, 86, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                htmlFor="email" 
                style={{ 
                  display: 'block', 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: '#1a2156', 
                  marginBottom: '12px',
                  letterSpacing: '0.025em'
                }}
              >
                Adresse email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="exemple@email.com"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a2156';
                  e.target.style.boxShadow = '0 0 0 3px rgba(26, 33, 86, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                htmlFor="password" 
                style={{ 
                  display: 'block', 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: '#1a2156', 
                  marginBottom: '12px',
                  letterSpacing: '0.025em'
                }}
              >
                Mot de passe *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Entrez le mot de passe"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    paddingRight: '56px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1a2156';
                    e.target.style.boxShadow = '0 0 0 3px rgba(26, 33, 86, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#1a2156',
                    padding: '8px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(26, 33, 86, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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

            {/* Role */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                htmlFor="role" 
                style={{ 
                  display: 'block', 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: '#1a2156', 
                  marginBottom: '12px',
                  letterSpacing: '0.025em'
                }}
              >
                Rôle *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                disabled
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: 'rgba(26, 33, 86, 0.05)',
                  color: '#1a2156',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  cursor: 'not-allowed',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <option value="admin">Administrateur</option>
              </select>
            </div>

            {/* Active Status */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '16px 20px',
                backgroundColor: 'rgba(26, 33, 86, 0.05)',
                borderRadius: '12px',
                border: '2px solid rgba(26, 33, 86, 0.1)',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '16px',
                    accentColor: '#1a2156'
                  }}
                />
                <div>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#1a2156' }}>
                    Compte actif
                  </span>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#6b7280', 
                    margin: '4px 0 0 0',
                    lineHeight: '1.4'
                  }}>
                    L'utilisateur pourra se connecter immédiatement
                  </p>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                style={{
                  padding: '16px 32px',
                  border: '2px solid #1a2156',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: 'transparent',
                  color: '#1a2156',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.6 : 1,
                  letterSpacing: '0.025em'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#1a2156';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#1a2156';
                  }
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '16px 32px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: loading ? 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 100%)' : 'linear-gradient(135deg, #1a2156 0%, #2563eb 100%)',
                  color: '#ffffff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(26, 33, 86, 0.3)',
                  letterSpacing: '0.025em'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(26, 33, 86, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 33, 86, 0.3)';
                  }
                }}
              >
                {loading && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                {loading ? 'Création...' : 'Créer l\'administrateur'}
              </button>
            </div>
          </form>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AddUser;
