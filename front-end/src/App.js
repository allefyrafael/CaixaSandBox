import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import FormPage from './pages/FormPage';
import ClassificationPage from './pages/ClassificationPage';
import MetricsPage from './pages/MetricsPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import MyIdeasPage from './pages/MyIdeasPage';
import ColaboratorLoginPage from './pages/ColaboratorLoginPage';
import Navbar from './components/Navbar';
import CollaboratorNavbar from './components/CollaboratorNavbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardApp from './dashboard/DashboardApp';
import { AutosaveProvider } from './contexts/AutosaveContext';

// Importa testes do Watson apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  import('./utils/testWatsonIntegration');
  import('./utils/debugWatsonConnection');
}

function App() {
  return (
    <Router basename="/CaixaSandBox">
      <div className="min-h-screen bg-gray-50">
        <ScrollToTop />
        <Routes>
          {/* Public Site Routes */}
          <Route path="/" element={
            <>
              <Navbar />
              <main className="flex-1">
                <HomePage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/demo" element={<RoleSelectionPage />} />
          <Route path="/classificacao" element={
            <>
              <Navbar />
              <main className="flex-1">
                <ClassificationPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/metricas" element={
            <>
              <Navbar />
              <main className="flex-1">
                <MetricsPage />
              </main>
              <Footer />
            </>
          } />
          
          {/* Collaborator Routes */}
          <Route path="/colaborador/login" element={<ColaboratorLoginPage />} />
          <Route path="/colaborador/formulario" element={
            <ProtectedRoute>
              <AutosaveProvider>
                <CollaboratorNavbar />
                <main className="flex-1">
                  <FormPage />
                </main>
                <Footer />
              </AutosaveProvider>
            </ProtectedRoute>
          } />
          <Route path="/colaborador/minhas-ideias" element={
            <ProtectedRoute>
              <CollaboratorNavbar />
              <main className="flex-1">
                <MyIdeasPage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          
          {/* Dashboard Routes - No Navbar/Footer */}
          <Route path="/dashboard/*" element={<DashboardApp />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e3a8a', // Azul CAIXA
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            },
            success: {
              iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
              },
              style: {
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              },
            },
            error: {
              iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
              },
              style: {
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
              },
            },
            loading: {
              style: {
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;

