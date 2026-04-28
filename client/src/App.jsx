import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Protected Route & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Tasks from './pages/Tasks';
import StudyPlanner from './pages/StudyPlanner';
import Notes from './pages/Notes';
import FocusTimer from './pages/FocusTimer';
import AIReviewer from './pages/AIReviewer';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes wrapped in Layout */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/study-planner" element={<StudyPlanner />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/focus-timer" element={<FocusTimer />} />
        <Route path="/ai-reviewer" element={<AIReviewer />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;