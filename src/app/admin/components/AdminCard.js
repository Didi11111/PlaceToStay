// components/AdminCard.js
import React from 'react';

const AdminCard = ({ title, description, onClick }) => (
  <div 
    className="bg-white rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer" 
    onClick={onClick}
  >
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
    </div>
  </div>
);

export default AdminCard;
