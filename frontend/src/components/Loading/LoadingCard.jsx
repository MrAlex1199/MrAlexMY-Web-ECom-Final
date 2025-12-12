import React from 'react';

const LoadingCard = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          {/* Image placeholder */}
          <div className="w-full h-48 bg-gray-300"></div>
          
          {/* Content placeholder */}
          <div className="p-4">
            {/* Title */}
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            
            {/* Price */}
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-3"></div>
            
            {/* Button */}
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingCard;