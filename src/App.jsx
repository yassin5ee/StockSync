import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import DataAnalyst from './components/DataAnalyst/DataAnalyst';
import WarehouseManager from './components/warehouse/warehouse';
import PreparateurCommandes from './components/preparateur-commandes/PreparateurCommandes';
import AdministrationLogistique from './components/administration-logistique/AdministrationLogistique';
import AgentReception from './components/agent-reception/AgentReception';
import Parametres from './components/parametres/Parametres';
import Accueil from './pages/Accueil';
import Login from './pages/Login';

// Main App component with routing
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Accueil />} />
          <Route path="/login" element={<Login />} />
          
          {/* Application routes with navigation */}
          <Route path="/home" element={<Accueil />} />
          <Route path="/data-analyst" element={<DataAnalystWrapper />} />
          <Route path="/gestionnaire-entrepot" element={<WarehouseManagerWrapper />} />
          <Route path="/preparateur-commandes" element={<PreparateurCommandesWrapper />} />
          <Route path="/administration-logistique" element={<AdministrationLogistiqueWrapper />} />
          <Route path="/agent-reception" element={<AgentReceptionWrapper />} />
          <Route path="/parametres" element={<ParametresWrapper />} />
          
          {/* Fallback route */}
          <Route path="*" element={<div>Page non trouvée</div>} />
        </Routes>
      </div>
    </Router>
  );
}

// Home page component with navigation between main sections
function HomePage() {
  const [currentPage, setCurrentPage] = useState('');
  const navigate = useNavigate();

  const handleNavigation = (page) => {
    setCurrentPage(page);
    // Update URL based on page
    switch (page) {
      case 'data_analyst':
        navigate('/data-analyst');
        break;
      case 'gestionnaire_entrepot':
        navigate('/gestionnaire-entrepot');
        break;
      case 'preparateur_commandes':
        navigate('/preparateur-commandes');
        break;
      case 'administration_logistique':
        navigate('/administration-logistique');
        break;
      case 'agent_reception':
        navigate('/agent-reception');
        break;
      case 'parametres':
        navigate('/parametres');
        break;
      default:
        navigate('/');
    }
  };

  const handleLogout = () => {
    console.log("Déconnexion de l'utilisateur");
    navigate('/login');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'data_analyst':
        return <DataAnalyst onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'gestionnaire_entrepot':
        return <WarehouseManager onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'preparateur_commandes':
        return <PreparateurCommandes onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'administration_logistique':
        return <AdministrationLogistique onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'agent_reception':
        return <AgentReception onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'parametres':
        return <Parametres onNavigate={handleNavigation} onLogout={handleLogout} />;
      default:
        return <DataAnalyst onNavigate={handleNavigation} onLogout={handleLogout} />;
    }
  };

  return (
    <div>
      {renderCurrentPage()}
    </div>
  );
}

// Wrapper components for direct routing
function DataAnalystWrapper() {
  const navigate = useNavigate();
  
  const handleNavigation = (page) => {
    handlePageNavigation(page, navigate);
  };

  const handleLogout = () => {
    console.log("Déconnexion de l'utilisateur");
    navigate('/login');
  };

  return <DataAnalyst onNavigate={handleNavigation} onLogout={handleLogout} />;
}

function WarehouseManagerWrapper() {
  const navigate = useNavigate();
  
  const handleNavigation = (page) => {
    handlePageNavigation(page, navigate);
  };

  const handleLogout = () => {
    console.log("Déconnexion de l'utilisateur");
    navigate('/login');
  };

  return <WarehouseManager onNavigate={handleNavigation} onLogout={handleLogout} />;
}

function PreparateurCommandesWrapper() {
  const navigate = useNavigate();
  
  const handleNavigation = (page) => {
    handlePageNavigation(page, navigate);
  };

  const handleLogout = () => {
    console.log("Déconnexion de l'utilisateur");
    navigate('/login');
  };

  return <PreparateurCommandes onNavigate={handleNavigation} onLogout={handleLogout} />;
}

function AdministrationLogistiqueWrapper() {
  const navigate = useNavigate();
  
  const handleNavigation = (page) => {
    handlePageNavigation(page, navigate);
  };

  const handleLogout = () => {
    console.log("Déconnexion de l'utilisateur");
    navigate('/login');
  };

  return <AdministrationLogistique onNavigate={handleNavigation} onLogout={handleLogout} />;
}

function AgentReceptionWrapper() {
  const navigate = useNavigate();
  
  const handleNavigation = (page) => {
    handlePageNavigation(page, navigate);
  };

  const handleLogout = () => {
    console.log("Déconnexion de l'utilisateur");
    navigate('/login');
  };

  return <AgentReception onNavigate={handleNavigation} onLogout={handleLogout} />;
}

function ParametresWrapper() {
  const navigate = useNavigate();
  
  const handleNavigation = (page) => {
    handlePageNavigation(page, navigate);
  };

  const handleLogout = () => {
    console.log("Déconnexion de l'utilisateur");
    navigate('/login');
  };

  return <Parametres onNavigate={handleNavigation} onLogout={handleLogout} />;
}

// Helper function to handle page navigation consistently
function handlePageNavigation(page, navigate) {
  switch (page) {
    case 'data_analyst':
      navigate('/data-analyst');
      break;
    case 'gestionnaire_entrepot':
      navigate('/gestionnaire-entrepot');
      break;
    case 'preparateur_commandes':
      navigate('/preparateur-commandes');
      break;
    case 'administration_logistique':
      navigate('/administration-logistique');
      break;
    case 'agent_reception':
      navigate('/agent-reception');
      break;
    case 'parametres':
      navigate('/parametres');
      break;
    case 'home':
      navigate('/home');
      break;
    case 'login':
      navigate('/login');
      break;
    default:
      navigate('/');
  }
}

export default App;