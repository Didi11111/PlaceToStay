'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserAuth } from '../auth/AuthContext';
import { db } from '../firebaseConfig';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';

const BookingPage = () => {
  const { user } = UserAuth();
  const searchParams = useSearchParams();
  const accommodationId = searchParams.get('accommodation');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [days, setDays] = useState(1);
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [maxRooms, setMaxRooms] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push(`/login?redirect=/booking?accommodation=${accommodationId}`);
      return;
    }

    // Fetch accommodation details only if the user is logged in
    const fetchAccommodation = async () => {
      if (!accommodationId) {
        setMessage('Accommodation ID is missing.');
        setIsLoading(false);
        return;
      }

      try {
        const accommodationRef = doc(db, 'accommodations', accommodationId);
        const accommodationSnap = await getDoc(accommodationRef);

        if (accommodationSnap.exists()) {
          const accommodationData = accommodationSnap.data();
          setSelectedAccommodation({ id: accommodationSnap.id, ...accommodationData });

          if (accommodationData.availability) {
            setAvailableDates(Object.keys(accommodationData.availability));
          }
        } else {
          setMessage('Accommodation not found.');
        }
      } catch (error) {
        console.error('Error fetching accommodation:', error);
        setMessage('Error fetching accommodation.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccommodation();
  }, [user, accommodationId, router]);

  const handleDateChange = (e) => {
    const selected = e.target.value;
    setSelectedDate(selected);

    if (selectedAccommodation && selectedAccommodation.availability[selected]) {
      setMaxRooms(selectedAccommodation.availability[selected]);
      setRooms(1);
    }
  };

  const handleDaysChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setDays(isNaN(value) ? 1 : value); // Default to 1 if NaN
  };

  const handleAdultsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setAdults(isNaN(value) ? 1 : value); // Default to 1 if NaN
  };

  const handleKidsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setKids(isNaN(value) ? 0 : value); // Default to 0 if NaN
  };

  const handleRoomsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setRooms(isNaN(value) ? 1 : value); // Default to 1 if NaN
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccommodation || !selectedDate || rooms > maxRooms || rooms <= 0) {
      setMessage('Please select a valid accommodation, date, and room count.');
      return;
    }

    try {
      const datesToCheck = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        datesToCheck.push(dateString);
      }

      const isAvailable = datesToCheck.every(
        (date) => selectedAccommodation.availability[date] >= rooms
      );

      if (!isAvailable) {
        setMessage('Not enough rooms available for all selected dates.');
        return;
      }

      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        accommodationId: selectedAccommodation.id,
        adults,
        kids,
        rooms,
        date: selectedDate,
        days,
        status: 'confirmed',
      });

      const accommodationRef = doc(db, 'accommodations', selectedAccommodation.id);
      const updates = datesToCheck.reduce((acc, date) => {
        const newAvailableRooms = selectedAccommodation.availability[date] - rooms;
        acc[`availability.${date}`] = newAvailableRooms;
        return acc;
      }, {});

      await updateDoc(accommodationRef, updates);

      setMessage(
        `Booking successful for ${adults} adults, ${kids} kids, and ${rooms} room(s) starting from ${selectedDate} for ${days} day(s).`
      );

      // Redirect back to the home page or booking confirmation page
      router.push('/');
    } catch (error) {
      console.error('Error adding booking:', error);
      setMessage('Booking failed. Please try again.');
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-center text-gray-900">Book Your Stay</h2>

        {message && (
          <div className={`mt-4 p-4 ${message.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-lg`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Accommodation:</label>
            <input
              type="text"
              value={selectedAccommodation?.name || 'Fetching accommodation...'}
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-200"
            />
          </div>

          {availableDates.length > 0 && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Available Dates:</label>
              <select
                value={selectedDate}
                onChange={handleDateChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Date</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Days:</label>
            <input
              type="number"
              value={days}
              onChange={handleDaysChange}
              min="1"
              max="3"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Adults:</label>
            <input
              type="number"
              value={adults}
              onChange={handleAdultsChange}
              min="1"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Kids:</label>
            <input
              type="number"
              value={kids}
              onChange={handleKidsChange}
              min="0"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Rooms:</label>
            <input
              type="number"
              value={rooms}
              onChange={handleRoomsChange}
              min="1"
              max={maxRooms}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-sm text-gray-500">Max rooms available: {maxRooms}</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            Book Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
