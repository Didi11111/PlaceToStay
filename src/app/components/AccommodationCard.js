'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const AccommodationCard = ({ accommodation }) => {
  const router = useRouter(); 

  // Function to handle booking action
  const handleBook = () => {
    // Pass the accommodation ID through the URL
    router.push(`/booking?accommodation=${encodeURIComponent(accommodation.id)}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300">
      <img 
        src={accommodation.image || `https://source.unsplash.com/featured/?hotel,${accommodation.location}`} 
        alt={accommodation.name} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{accommodation.name}</h2>
        <p className="text-gray-600 mb-4">Location: {accommodation.location}</p>
        <p className="text-gray-600 mb-4">Type: {accommodation.type}</p>
        <div className="text-gray-600 mb-4">
          Availability:
          <ul className="mt-2 space-y-1">
            {Object.entries(accommodation.availability).map(([date, availableRooms]) => (
              <li key={date} className="text-sm">{date}: {availableRooms} rooms</li>
            ))}
          </ul>
        </div>
        <button 
          onClick={handleBook} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 transition-colors duration-300"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default AccommodationCard;
