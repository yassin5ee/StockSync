import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Accueil from './pages/Accueil';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Point d’entrée par défaut redirigé vers Accueil */}
        <Route path="/" element={<Accueil />} />
        <Route path="/login" element={<Login />} />
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
