import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Accueil from './pages/Accueil';
import DataAnalyst from './components/DataAnalyst/DataAnalyst';
import AdministrationLogistique from './components/administration-logistique/AdministrationLogistique';
import AgentReception from './components/agent-reception/AgentReception';
import PreparateurCommandes from './components/preparateur-commandes/PreparateurCommandes';
import Parametres from './components/parametres/Parametres';
import Warehouse from './components/warehouse/warehouse';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Point d’entrée par défaut redirigé vers Accueil */}
        <Route path="/" element={<Accueil />} />
  <Route path="/login" element={<Login />} />
  <Route path="/home" element={<Accueil />} />
  <Route path="/data-analyst" element={<DataAnalyst />} />
  <Route path="/administration-logistique" element={<AdministrationLogistique />} />
  <Route path="/agent-reception" element={<AgentReception />} />
  <Route path="/preparateur-commandes" element={<PreparateurCommandes />} />
  <Route path="/parametres" element={<Parametres />} />
  <Route path="/gestionnaire-entrepot" element={<Warehouse />} />
        {/* Si la route est inconnue, on redirige vers la page d’accueil */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;



//import React from 'react';
//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//import Login from './pages/Login';
//import Accueil from './pages/Accueil';
//import './App.css';

//function App() {
  //return (
    //<Router>
      //<Routes>
        //<Route path="/" element={<Login />} />
        //<Route path="/accueil" element={<Accueil />} />
        //<Route path="*" element={<Navigate to="/" replace />} />
      //</Routes>
    //</Router>
  //);
//}

//export default App;
