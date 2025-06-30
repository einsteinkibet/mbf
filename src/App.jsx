import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import PrivateRoute from './auth/PrivateRoute';
import RoleBasedRoute from './auth/RoleBasedRoute';
import LoginForm from './auth/LoginForm';
import Home from './components/Home';

import ActionPanel from './components/admin/ActionPanel';
import AddStudent from './components/admin/AddStudent';
import StudentDetails from './components/admin/StudentDetails';
import AdminDashboard from './components/admin/AdminDashboard';
import ClassManagement from './components/admin/ClassManagement';
import SubjectManagement from './components/admin/SubjectManagement';
import Messaging from './components/admin/Messaging';
import Printer from './components/admin/Printer';
import StaffList from './components/admin/StaffList';
import TermFeeManagement from './components/admin/TermFeeManagement';
import GradeSubjects from './components/admin/GradeSubjects';
import PerformanceHistory from './components/admin/PerformanceHistory';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/performance-history" element={<PerformanceHistory />} />

          {/* admin routes */}
          <Route path="/admin" element={<PrivateRoute><RoleBasedRoute role="admin"><AdminDashboard /></RoleBasedRoute></PrivateRoute>} />
          <Route path="/actions" element={<PrivateRoute><RoleBasedRoute role="admin"><ActionPanel /></RoleBasedRoute></PrivateRoute>} />
          <Route path="/add-student" element={<PrivateRoute><RoleBasedRoute role="admin"><AddStudent /></RoleBasedRoute></PrivateRoute>} />
          <Route path="/classes" element={<PrivateRoute><RoleBasedRoute role="admin"><ClassManagement /></RoleBasedRoute></PrivateRoute>} />
          <Route path="/subjects" element={<PrivateRoute><RoleBasedRoute role="admin"><SubjectManagement /></RoleBasedRoute></PrivateRoute>} />
          <Route path="/messaging" element={<PrivateRoute><RoleBasedRoute role="admin"><Messaging /></RoleBasedRoute></PrivateRoute>} />
          <Route path="/printer" element={<PrivateRoute><RoleBasedRoute role="admin"><Printer /></RoleBasedRoute></PrivateRoute>} />
          <Route path="/terms" element={<PrivateRoute><RoleBasedRoute role="admin"><TermFeeManagement /></RoleBasedRoute></PrivateRoute>} />
          <Route path="/grade-subjects" element={<PrivateRoute><RoleBasedRoute role="admin"><GradeSubjects /></RoleBasedRoute></PrivateRoute>} />
          <Route path="/student-details" element={<PrivateRoute><RoleBasedRoute role="admin"><StudentDetails /></RoleBasedRoute></PrivateRoute>} />
          <Route path="/staff" element={<PrivateRoute><RoleBasedRoute role="admin"><StaffList /></RoleBasedRoute></PrivateRoute>} />


          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>
    </AuthProvider>

  );
}
export default App;