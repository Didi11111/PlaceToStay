'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc as firestoreDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'; 
import { UserAuth } from '../../auth/AuthContext';

const UserBookings = () => {
  const { user } = UserAuth();
  const [bookings, setBookings] = useState([]);
  const [editBookingId, setEditBookingId] = useState(null);
  const [editData, setEditData] = useState({
    accommodationName: '',
    date: '',
    days: 1,
    adults: 1,
    kids: 0,
    rooms: 1,
  });
  const [previousRooms, setPreviousRooms] = useState(0); 
  const [maxRoomsAvailable, setMaxRoomsAvailable] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      if (user) {
        const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const bookingsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const bookingData = doc.data();
            const accommodationRef = firestoreDoc(db, 'accommodations', bookingData.accommodationId);
            const accommodationSnap = await getDoc(accommodationRef);
            const accommodationName = accommodationSnap.exists() ? accommodationSnap.data().name : 'Unknown Accommodation';
            return { id: doc.id, ...bookingData, accommodationName };
          })
        );
        setBookings(bookingsData);
      }
    };

    fetchBookings();
  }, [user]);

  const handleEdit = async (booking) => {
    setEditBookingId(booking.id);
    setPreviousRooms(booking.rooms);
    setEditData({
      accommodationName: booking.accommodationName,
      date: booking.date,
      days: booking.days,
      adults: booking.adults,
      kids: booking.kids,
      rooms: booking.rooms,
    });

    const accommodationRef = firestoreDoc(db, 'accommodations', booking.accommodationId);
    const accommodationSnap = await getDoc(accommodationRef);
    if (accommodationSnap.exists()) {
      const availability = accommodationSnap.data().availability;
      const availableRooms = availability[booking.date];
      setMaxRoomsAvailable(availableRooms + booking.rooms);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  const handleUpdate = async (bookingId, accommodationId, selectedDate) => {
    const newRoomsRequested = parseInt(editData.rooms, 10);
    const selectedDays = parseInt(editData.days, 10);
  
    if (newRoomsRequested > maxRoomsAvailable) {
      setErrorMessage(`You cannot book more than ${maxRoomsAvailable} rooms for the selected date.`);
      return;
    }
  
    try {
      const accommodationRef = firestoreDoc(db, 'accommodations', accommodationId);
      const accommodationSnap = await getDoc(accommodationRef);
      if (!accommodationSnap.exists()) {
        setErrorMessage('Accommodation not found.');
        return;
      }
  
      const availability = accommodationSnap.data().availability;
      const datesToCheck = [];
      for (let i = 0; i < selectedDays; i++) {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        datesToCheck.push(dateString);
      }
  
      // Check availability for all selected dates
      const isAvailable = datesToCheck.every(
        (date) => availability[date] >= newRoomsRequested
      );
  
      if (!isAvailable) {
        setErrorMessage('Not enough rooms available for all selected dates.');
        return;
      }
  
      const bookingRef = firestoreDoc(db, 'bookings', bookingId);
  
      // Update the booking in Firestore
      await updateDoc(bookingRef, {
        date: editData.date,
        days: selectedDays,
        adults: parseInt(editData.adults, 10),
        kids: parseInt(editData.kids, 10),
        rooms: newRoomsRequested,
      });
  
      // Adjust the availability in Firestore
      const updates = datesToCheck.reduce((acc, date) => {
        const currentAvailableRooms = availability[date];
        const newAvailableRooms = currentAvailableRooms + previousRooms - newRoomsRequested;
        acc[`availability.${date}`] = newAvailableRooms;
        return acc;
      }, {});
  
      await updateDoc(accommodationRef, updates);
  
      setEditBookingId(null);
      setErrorMessage('');
  
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, ...editData } : booking
      );
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error updating booking:', error);
      setErrorMessage('Error updating booking. Please try again.');
    }
  };

  const handleDelete = async (bookingId, accommodationId, selectedDate, roomsBooked) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const bookingRef = firestoreDoc(db, 'bookings', bookingId);
        await deleteDoc(bookingRef);

        const accommodationRef = firestoreDoc(db, 'accommodations', accommodationId);
        const accommodationSnap = await getDoc(accommodationRef);
        if (accommodationSnap.exists()) {
          const availability = accommodationSnap.data().availability;
          const currentAvailableRooms = availability[selectedDate];
          const newAvailableRooms = currentAvailableRooms + roomsBooked;

          await updateDoc(accommodationRef, {
            [`availability.${selectedDate}`]: newAvailableRooms,
          });
        }

        setBookings(bookings.filter(booking => booking.id !== bookingId));
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map(booking => (
          <div key={booking.id} className="mb-4 p-4 bg-white shadow-md rounded-lg">
            {editBookingId === booking.id ? (
              <>
                <p><strong>Accommodation:</strong> {booking.accommodationName}</p>
                <p><strong>Date:</strong>
                  <input
                    type="date"
                    name="date"
                    value={editData.date}
                    onChange={handleInputChange}
                    className="border p-2 rounded-md"
                  />
                </p>
                <p><strong>Days:</strong>
                  <input
                    type="number"
                    name="days"
                    value={editData.days}
                    onChange={handleInputChange}
                    className="border p-2 rounded-md"
                    min="1"
                    max="3"
                  />
                </p>
                <p><strong>Adults:</strong>
                  <input
                    type="number"
                    name="adults"
                    value={editData.adults}
                    onChange={handleInputChange}
                    className="border p-2 rounded-md"
                  />
                </p>
                <p><strong>Kids:</strong>
                  <input
                    type="number"
                    name="kids"
                    value={editData.kids}
                    onChange={handleInputChange}
                    className="border p-2 rounded-md"
                  />
                </p>
                <p><strong>Rooms:</strong>
                  <input
                    type="number"
                    name="rooms"
                    value={editData.rooms}
                    onChange={handleInputChange}
                    className="border p-2 rounded-md"
                  />
                </p>
                <div className="text-sm text-red-500">{`Max rooms available: ${maxRoomsAvailable}`}</div>
                {errorMessage && <div className="text-red-500">{errorMessage}</div>}
                <button
                  onClick={() => handleUpdate(booking.id, booking.accommodationId, booking.date)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                >
                  Update Booking
                </button>
              </>
            ) : (
              <>
                <p><strong>Accommodation:</strong> {booking.accommodationName}</p>
                <p><strong>Date:</strong> {booking.date}</p>
                <p><strong>Days:</strong> {booking.days}</p>
                <p><strong>Adults:</strong> {booking.adults}</p>
                <p><strong>Kids:</strong> {booking.kids}</p>
                <p><strong>Rooms:</strong> {booking.rooms}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleEdit(booking)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                  >
                    Edit Booking
                  </button>
                  <button
                    onClick={() => handleDelete(booking.id, booking.accommodationId, booking.date, booking.rooms)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md mt-2"
                  >
                    Delete Booking
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default UserBookings;
