import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import '@/index.css';
import { Toaster } from 'sonner';

// Pages
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import LeadScraper from '@/pages/LeadScraper';
import CRMPage from '@/pages/CRMPage';
import EmailCampaigns from '@/pages/EmailCampaigns';
import AIAgentSettings from '@/pages/AIAgentSettings';
import SettingsPage from '@/pages/SettingsPage';

// Layout
import DashboardLayout from '@/components/DashboardLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Axios interceptor for auth
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/scraper" element={<LeadScraper />} />
                    <Route path="/crm" element={<CRMPage />} />
                    <Route path="/campaigns" element={<EmailCampaigns />} />
                    <Route path="/ai-agent" element={<AIAgentSettings />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
