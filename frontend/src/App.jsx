
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Recommendation from './pages/Recommendation';
import Analytics from './pages/Analytics';
import './index.css'; // Import the new styling

function App() {
  return (
    <Router>
      <div className="header">
        <nav>
          <Link to="/">Product Recommendation Assistant</Link>
          <Link to="/analytics">Analytics Dashboard</Link>
        </nav>
      </div>
      <div className="container">
        <Routes>
          <Route path="/" element={<Recommendation />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;