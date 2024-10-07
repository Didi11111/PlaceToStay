'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc, query, where } from 'firebase/firestore';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [accommodations, setAccommodations] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const snapshot = await getDocs(collection(db, 'bookings'));
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingsData);
    };

    const fetchAccommodations = async () => {
      const snapshot = await getDocs(collection(db, 'accommodations'));
      const accommodationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccommodations(accommodationsData);
    };

    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    };

    fetchBookings();
    fetchAccommodations();
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredBookings(bookings);
  }, [bookings]);

  const handleSearch = async () => {
    if (searchEmail.trim() === '') {
      setFilteredBookings(bookings);
      return;
    }

    const usersSnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', searchEmail)));
    const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (usersData.length === 0) {
      alert('No user found with this email.');
      return;
    }

    const userId = usersData[0].userId;
    const filtered = bookings.filter(booking => booking.userId === userId);
    setFilteredBookings(filtered);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      await deleteDoc(doc(db, 'bookings', id));
      setBookings(prev => prev.filter(booking => booking.id !== id));
    }
  };

  const handleEditBooking = async (booking) => {
    const availableAccommodations = accommodations.filter(acc =>
      acc.availability[booking.date] > 0
    );
    setEditingBooking({ ...booking, availableAccommodations });
  };

  const handleUpdateBooking = async () => {
    const { id, accommodationId, date, days, adults, kids } = editingBooking;
    const bookingRef = doc(db, 'bookings', id);
    const accommodationRef = doc(db, 'accommodations', accommodationId);

    const accommodationDoc = await getDoc(accommodationRef);
    const accommodationData = accommodationDoc.data();
    const totalRoomsNeeded = adults + kids;

    const datesToCheck = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(date);
      currentDate.setDate(currentDate.getDate() + i);
      const formattedDate = currentDate.toISOString().split('T')[0];
      datesToCheck.push(formattedDate);
    }

    // Check if there are enough rooms for each date in the range
    const isAvailable = datesToCheck.every(
      (d) => accommodationData.availability[d] >= totalRoomsNeeded
    );

    if (!isAvailable) {
      alert('Not enough rooms available for the selected dates.');
      return;
    }

    // Update booking data in Firestore
    await updateDoc(bookingRef, {
      date,
      days,
      adults,
      kids,
      status: editingBooking.status,
    });

    // Update room availability for each date
    const updatedAvailability = { ...accommodationData.availability };
    datesToCheck.forEach((d) => {
      updatedAvailability[d] -= totalRoomsNeeded;
    });

    await updateDoc(accommodationRef, {
      availability: updatedAvailability,
    });

    alert('Booking updated successfully!');
    setEditingBooking(null);
    setBookings(prev =>
      prev.map(booking => (booking.id === editingBooking.id ? editingBooking : booking))
    );
  };

  const handleDateChange = (date) => {
    const availableAccommodations = accommodations.filter(acc =>
      acc.availability[date] > 0
    );
    setEditingBooking(prev => ({
      ...prev,
      date,
      availableAccommodations,
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4">Manage Bookings</h2>

      <div className="mb-4">
        <input
          type="text"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Search by user email"
          className="border border-gray-300 rounded px-3 py-1 w-full mb-2"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
        >
          Search
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {filteredBookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          filteredBookings.map(booking => {
            const user = users.find(u => u.userId === booking.userId);
            const accommodation = accommodations.find(acc => acc.id === booking.accommodationId);

            return (
              <div key={booking.id} className="mb-4 p-4 bg-white shadow-md rounded-lg">
                <p><strong>User Name:</strong> {user?.firstName || 'N/A'}</p>
                <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>Accommodation:</strong> {accommodation?.name || 'N/A'} - {accommodation?.type || 'N/A'}</p>
                <p><strong>Date:</strong> {booking.date}</p>
                <p><strong>Days:</strong> {booking.days}</p>
                <p><strong>Adults:</strong> {booking.adults}</p>
                <p><strong>Kids:</strong> {booking.kids}</p>
                <p><strong>Status:</strong> {booking.status}</p>

                <button
                  onClick={() => handleEditBooking(booking)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(booking.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>

      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg overflow-y-auto max-h-full">
            <h3 className="text-lg font-bold mb-4">Edit Booking</h3>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Date:</label>
              <input
                type="date"
                value={editingBooking.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 w-full"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Days:</label>
              <input
                type="number"
                value={editingBooking.days}
                onChange={(e) => setEditingBooking({ ...editingBooking, days: parseInt(e.target.value, 10) })}
                className="border border-gray-300 rounded px-3 py-1 w-full"
                min="1"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Accommodation:</label>
              <select
                value={editingBooking.accommodationId}
                onChange={(e) => setEditingBooking({ ...editingBooking, accommodationId: e.target.value })}
                className="border border-gray-300 rounded px-3 py-1 w-full"
              >
                {editingBooking.availableAccommodations.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} - {acc.type}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Adults:</label>
              <input
                type="number"
                value={editingBooking.adults}
                onChange={(e) => setEditingBooking({ ...editingBooking, adults: parseInt(e.target.value, 10) })}
                className="border border-gray-300 rounded px-3 py-1 w-full"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Kids:</label>
              <input
                type="number"
                value={editingBooking.kids}
                onChange={(e) => setEditingBooking({ ...editingBooking, kids: parseInt(e.target.value, 10) })}
                className="border border-gray-300 rounded px-3 py-1 w-full"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Status:</label>
              <select
                value={editingBooking.status}
                onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value })}
                className="border border-gray-300 rounded px-3 py-1 w-full"
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setEditingBooking(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBooking}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

