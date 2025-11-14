import { useState } from 'react';
import './App.css';
import DataAnalyst from './components/DataAnalyst/DataAnalyst';
import WarehouseManager from './components/warehouse/warehouse';

function App() {
  const [currentPage, setCurrentPage] = useState('DataAnalyst');

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    console.log("Déconnexion de l'utilisateur");
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'data_analyst':
        return <DataAnalyst onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'gestionnaire_entrepot':
        return <WarehouseManager onNavigate={handleNavigation} onLogout={handleLogout} />;
      default:
        return <DataAnalyst onNavigate={handleNavigation} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PreparateurCommandes from './components/preparateur-commandes/PreparateurCommandes';
import AdministrationLogistique from './components/administration-logistique/AdministrationLogistique';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/preparateur-commandes" element={<PreparateurCommandes />} />
          <Route path="/administration-logistique" element={<AdministrationLogistique />} />
          {/* Ajoutez d'autres routes au besoin */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
