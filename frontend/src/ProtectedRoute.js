import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAdmin, adminLoading, children }) => {
  // Show loading while checking admin status
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect to login page if user is not an admin
    return <Navigate to="/admin-login" replace />;
  }

  // Render the children components if user is an admin
  return children;
};

export default ProtectedRoute;