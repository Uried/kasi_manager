import './App.css'
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/categories" element={<AdminLayout><CategoriesList /></AdminLayout>} />
        <Route path="/categories/add" element={<AdminLayout><AddCategory /></AdminLayout>} />
        <Route path="/categories/update" element={<Navigate to="/categories" replace />} />
        <Route path="/categories/update/:id" element={<AdminLayout><UpdateCategory /></AdminLayout>} />
        <Route path="/products" element={<AdminLayout><ProductsList /></AdminLayout>} />
        <Route path="/products/add" element={<AdminLayout><AddProduct /></AdminLayout>} />
        <Route path="/products/inventory" element={<AdminLayout><ProductInventory /></AdminLayout>} />
        <Route path="/products/edit/:id" element={<AdminLayout><EditProduct /></AdminLayout>} />
        <Route path="/products/:id" element={<AdminLayout><ProductDetails /></AdminLayout>} />
        <Route path="/media/images" element={<AdminLayout><MediaLibrary /></AdminLayout>} />
        <Route path="/media" element={<Navigate to="/media/images" replace />} />
        {/* Autres routes à ajouter ici */}
      </Routes>
    </Router>
  )
}

export default App
