'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function DeletePlace() {
  const [places, setPlaces] = useState([]);

  const fetchPlaces = async () => {
    const snapshot = await getDocs(collection(db, 'accommodations'));
    const placesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlaces(placesData);
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this place?')) {
      await deleteDoc(doc(db, 'accommodations', id));
      fetchPlaces();  // Refresh the list after deletion
    }
  };

  return (
    <div className="mt-6 max-h-96 overflow-y-auto p-4 border border-gray-300 rounded-lg">
      {places.length === 0 ? (
        <p>No places found.</p>
      ) : (
        places.map((place) => (
          <div key={place.id} className="flex justify-between items-center p-2 border-b border-gray-200">
            <div>
              <p className="font-bold">{place.name}</p>
              <p className="text-gray-600">{place.location} - {place.type}</p>
            </div>
            <button
              onClick={() => handleDelete(place.id)}
              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors duration-300"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
