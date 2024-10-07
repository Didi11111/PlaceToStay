'use client';

import React, { useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function AddPlace() {
  const [placeName, setPlaceName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [image, setImage] = useState('');
  const [availability, setAvailability] = useState([{ date: '', rooms: '' }]);

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...availability];
    newAvailability[index][field] = value;
    setAvailability(newAvailability);
  };

  const handleAddDate = () => {
    setAvailability([...availability, { date: '', rooms: '' }]);
  };

  const handleRemoveDate = (index) => {
    const newAvailability = [...availability];
    newAvailability.splice(index, 1);
    setAvailability(newAvailability);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const availabilityMap = availability.reduce((acc, { date, rooms }) => {
      acc[date] = rooms === '' ? 0 : parseInt(rooms, 10);
      return acc;
    }, {});

    try {
      await addDoc(collection(db, 'accommodations'), {
        name: placeName,
        location,
        type,
        image, 
        availability: availabilityMap,
      });
      alert('Place added successfully!');
      setPlaceName('');
      setLocation('');
      setType('');
      setImage(''); 
      setAvailability([{ date: '', rooms: '' }]);
    } catch (error) {
      console.error('Error adding place:', error);
      alert('Failed to add place.');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-3 mt-12 p-4 max-w-lg mx-auto" 
    >
      <div>
        <label className="block text-gray-700">Place Name:</label>
        <input
          type="text"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          required
          className="w-full px-2 py-1 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-gray-700">Location:</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="w-full px-2 py-1 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-gray-700">Type:</label>
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="w-full px-2 py-1 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-gray-700">Image URL:</label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
          required
          className="w-full px-2 py-1 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-gray-700">Availability:</label>
        {availability.map((entry, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="date"
              value={entry.date}
              onChange={(e) => handleAvailabilityChange(index, 'date', e.target.value)}
              required
              className="w-1/2 px-2 py-1 border border-gray-300 rounded"
            />
            <input
              type="number"
              value={entry.rooms}
              onChange={(e) => handleAvailabilityChange(index, 'rooms', e.target.value)}
              placeholder="Rooms"
              required
              className="w-1/2 px-2 py-1 border border-gray-300 rounded"
            />
            {availability.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveDate(index)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddDate}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          Add Date
        </button>
      </div>
      <button
        type="submit"
        className="w-full mt-3 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
      >
        Add Place
      </button>
    </form>
  );
}


