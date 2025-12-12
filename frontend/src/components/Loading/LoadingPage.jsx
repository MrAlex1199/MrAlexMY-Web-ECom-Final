import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingPage = ({ message = 'กำลังโหลด...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xlarge" color="blue" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">{message}</h2>
        <p className="mt-2 text-sm text-gray-600">กรุณารอสักครู่</p>
      </div>
    </div>
  );
};

export default LoadingPage;