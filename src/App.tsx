import './App.css'
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import ProductsList from './pages/Products/ProductsList'
import AddProduct from './pages/Products/AddProduct'
import ProductDetails from './pages/Products/ProductDetails'
import ProductInventory from './pages/Products/ProductInventory'
import EditProduct from './pages/Products/EditProduct'
import MediaLibrary from './pages/Media'
import CategoriesList from './pages/Categories/CategoriesList'
import AddCategory from './pages/Categories/AddCategory'
import UpdateCategory from './pages/Categories/UpdateCategory'
import Orders from './pages/Orders'
import Users from './pages/Users'
import AddUser from './pages/Users/AddUser'
import Profile from './pages/Profile'
import Login from './pages/Auth/Login'
import ProtectedRoute from './components/ProtectedRoute'
import SplashScreen from './components/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><AdminLayout><CategoriesList /></AdminLayout></ProtectedRoute>} />
        <Route path="/categories/add" element={<ProtectedRoute><AdminLayout><AddCategory /></AdminLayout></ProtectedRoute>} />
        <Route path="/categories/update" element={<ProtectedRoute><Navigate to="/categories" replace /></ProtectedRoute>} />
        <Route path="/categories/update/:id" element={<ProtectedRoute><AdminLayout><UpdateCategory /></AdminLayout></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><AdminLayout><ProductsList /></AdminLayout></ProtectedRoute>} />
        <Route path="/products/add" element={<ProtectedRoute><AdminLayout><AddProduct /></AdminLayout></ProtectedRoute>} />
        <Route path="/products/inventory" element={<ProtectedRoute><AdminLayout><ProductInventory /></AdminLayout></ProtectedRoute>} />
        <Route path="/products/edit/:id" element={<ProtectedRoute><AdminLayout><EditProduct /></AdminLayout></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute><AdminLayout><ProductDetails /></AdminLayout></ProtectedRoute>} />
        <Route path="/media/images" element={<ProtectedRoute><AdminLayout><MediaLibrary /></AdminLayout></ProtectedRoute>} />
        <Route path="/media" element={<ProtectedRoute><Navigate to="/media/images" replace /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><AdminLayout><Orders /></AdminLayout></ProtectedRoute>} />
        <Route path="/orders/details" element={<ProtectedRoute><AdminLayout><Orders /></AdminLayout></ProtectedRoute>} />
        <Route path="/orders/whatsapp" element={<ProtectedRoute><AdminLayout><Orders /></AdminLayout></ProtectedRoute>} />
        <Route path="/orders/delivery" element={<ProtectedRoute><AdminLayout><Orders /></AdminLayout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />
        <Route path="/users/add" element={<ProtectedRoute><AdminLayout><AddUser /></AdminLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AdminLayout><Profile /></AdminLayout></ProtectedRoute>} />
        <Route path="/users/roles" element={<ProtectedRoute><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />
        <Route path="/users/activity" element={<ProtectedRoute><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />
        {/* Autres routes à ajouter ici */}
      </Routes>
    </Router>
  )
}

export default App
