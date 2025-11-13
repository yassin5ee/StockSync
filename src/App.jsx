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