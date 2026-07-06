import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Info from './pages/Info';
import Groups from './pages/Groups';
import Fixtures from './pages/Fixtures';
import Standings from './pages/Standings';
import Knockouts from './pages/Knockouts';
import MatchCenter from './pages/MatchCenter';
import Stats from './pages/Stats';
import Admin from './pages/Admin';
import TeamProfile from './pages/TeamProfile';
import MatchDetails from './pages/MatchDetails';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import InstallPrompt from './components/InstallPrompt';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <TournamentProvider>
        <InstallPrompt />
        <Toaster position="top-center" toastOptions={{
          style: { background: '#222', color: '#fff', border: '1px solid #333' }
        }} />
        <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="info" element={<Info />} />
            <Route path="groups" element={<Groups />} />
            <Route path="fixtures" element={<Fixtures />} />
            <Route path="match-center" element={<MatchCenter />} />
            <Route path="standings" element={<Standings />} />
            <Route path="knockouts" element={<Knockouts />} />
            <Route path="stats" element={<Stats />} />
            <Route path="admin" element={<Admin />} />
            <Route path="team/:id" element={<TeamProfile />} />
            <Route path="match/:id" element={<MatchDetails />} />
          </Route>
        </Routes>
      </Router>
      </TournamentProvider>
    </ErrorBoundary>
  );
}

export default App;
