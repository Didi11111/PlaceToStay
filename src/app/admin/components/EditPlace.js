//admin/Components/EditPlace.js
'use client';

import React, { useState, useEffect, Component } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function EditPlace({ onClose = () => {} }) {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newType, setNewType] = useState('');
  const [availability, setAvailability] = useState([]);

  const fetchPlaces = async () => {
    const snapshot = await getDocs(collection(db, 'accommodations'));
    const placesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlaces(placesData);
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handlePlaceSelection = (place) => {
    setSelectedPlace(place);
    setNewName(place.name);
    setNewLocation(place.location);
    setNewType(place.type);
    setAvailability(
      Object.entries(place.availability || {}).map(([date, rooms]) => ({
        date,
        rooms: rooms !== null && rooms !== undefined ? rooms.toString() : '', // Ensure rooms is a valid string
      }))
    );
  };

  const handleAvailabilityChange = (index, field, value) => {
    const updatedAvailability = [...availability];
    updatedAvailability[index][field] = value;
    setAvailability(updatedAvailability);
  };

  const handleAddDate = () => {
    setAvailability([...availability, { date: '', rooms: '' }]);
  };

  const handleRemoveDate = (index) => {
    const updatedAvailability = [...availability];
    updatedAvailability.splice(index, 1);
    setAvailability(updatedAvailability);
  };

  const handleEdit = async () => {
    // Check if any rooms field is set to 0
    if (availability.some(({ rooms }) => rooms === '0')) {
      alert('Room number cannot be 0. Please provide a valid number of rooms.');
      return;
    }

    const updatedAvailability = availability.reduce((acc, { date, rooms }) => {
      if (date) {
        acc[date] = rooms === '' ? 0 : parseInt(rooms, 10);
      }
      return acc;
    }, {});

    const placeRef = doc(db, 'accommodations', selectedPlace.id);
    await updateDoc(placeRef, {
      name: newName || selectedPlace.name,
      location: newLocation || selectedPlace.location,
      type: newType || selectedPlace.type,
      availability: updatedAvailability,
    });

    alert('Place updated successfully!');
    fetchPlaces();  // Refresh the list of places after update
    handleClearForm();  // Clear the form after submission
    onClose();  // Close the modal after submission
  };

  const handleClearForm = () => {
    setSelectedPlace(null);
    setNewName('');
    setNewLocation('');
    setNewType('');
    setAvailability([]);
  };

  return (
    <div className="mt-6 space-y-4"> 
      <select 
        onChange={(e) => handlePlaceSelection(JSON.parse(e.target.value))}
        className="border border-gray-300 rounded px-2 py-1 w-full"
      >
        <option>Select a place to edit</option>
        {places.map(place => (
          <option key={place.id} value={JSON.stringify(place)}>{place.name}</option>
        ))}
      </select>

      {selectedPlace && (
        <div className="mt-4 space-y-2">
          <div>
            <label className="block text-sm text-gray-700">New Name:</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={selectedPlace.name}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">New Location:</label>
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder={selectedPlace.location}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">New Type:</label>
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder={selectedPlace.type}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Availability:</label>
            {availability.map((entry, index) => (
              <div key={index} className="flex space-x-2 mb-2 items-center">
                <input
                  type="date"
                  value={entry.date}
                  onChange={(e) => handleAvailabilityChange(index, 'date', e.target.value)}
                  required
                  className="border border-gray-300 rounded px-2 py-1 w-1/2"
                />
                <input
                  type="number"
                  value={entry.rooms}
                  onChange={(e) => handleAvailabilityChange(index, 'rooms', e.target.value)}
                  placeholder="Rooms"
                  required
                  className="border border-gray-300 rounded px-2 py-1 w-1/3"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveDate(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 w-20"
                >
                  Delete
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={handleAddDate} 
              className="text-blue-500 hover:text-blue-700 mt-2"
            >
              Add Date
            </button>
          </div>

          <div className="mt-4 flex space-x-4">
            <button onClick={handleEdit} className="bg-blue-500 text-white px-3 py-2 rounded-lg">
              Edit Place
            </button>
            <button onClick={handleClearForm} className="bg-red-500 text-white px-3 py-2 rounded-lg">
              Clear Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

