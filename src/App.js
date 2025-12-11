import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import FormPage from './pages/FormPage';
import ClassificationPage from './pages/ClassificationPage';
import MetricsPage from './pages/MetricsPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import MyIdeasPage from './pages/MyIdeasPage';
import Navbar from './components/Navbar';
import CollaboratorNavbar from './components/CollaboratorNavbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import DashboardApp from './dashboard/DashboardApp';

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
          <Route path="/colaborador/formulario" element={
            <>
              <CollaboratorNavbar />
              <main className="flex-1">
                <FormPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/colaborador/minhas-ideias" element={
            <>
              <CollaboratorNavbar />
              <main className="flex-1">
                <MyIdeasPage />
              </main>
              <Footer />
            </>
          } />
          
          {/* Dashboard Routes - No Navbar/Footer */}
          <Route path="/dashboard/*" element={<DashboardApp />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;

