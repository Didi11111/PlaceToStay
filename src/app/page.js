'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import AccommodationCard from './components/AccommodationCard';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserAuth } from './auth/AuthContext';
import Modal from './components/Modal';
import LoginPage from './login/page';

export default function Home() {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [targetPage, setTargetPage] = useState('/');
  const router = useRouter();

  const { user } = UserAuth();

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async (type, city) => {
    try {
      setLoading(true); 
      const accommodationsRef = collection(db, 'accommodations');
      
      // Handle cases where both type and city 
      let q;
      if (type && city) {
        q = query(accommodationsRef, where("type", "==", type), where("location", "==", city));
      } else if (type) {
        q = query(accommodationsRef, where("type", "==", type));
      } else if (city) {
        q = query(accommodationsRef, where("location", "==", city));
      } else {
        q = accommodationsRef; 
      }
 
      const snapshot = await getDocs(q);
      const accommodationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Check if no results are found and update state accordingly
      setAccommodations(accommodationsData);
      setNoResults(accommodationsData.length === 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      setLoading(false);
    }
  };

  const handleSearch = (type, city) => {
    if (user) {
      fetchAccommodations(type, city);
    } else {
      const searchParams = new URLSearchParams({ type, city }).toString();
      setTargetPage(`/search?${searchParams}`); // Set target page with search parameters
      setModalOpen(true);
    }
  };

  const handleBook = (accommodationId) => {
    console.log('Accommodation ID in Home.js being passed to booking:', accommodationId);
    if (user) {
      router.push(`/booking?accommodation=${encodeURIComponent(accommodationId)}`);
    } else {
      setTargetPage(`/booking?accommodation=${encodeURIComponent(accommodationId)}`);
      setModalOpen(true);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      {/* <Hero /> */}
      <Hero accommodations={accommodations} />
      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {noResults ? (
            <p>No accommodations found matching your search criteria.</p>
          ) : (
            accommodations.map((acc) => (
              <AccommodationCard
                key={acc.id}
                accommodation={acc}
                onBook={handleBook} 
              />
            ))
          )}
        </section>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <LoginPage onClose={() => setModalOpen(false)} targetPage={targetPage} />
      </Modal>
    </main>
  );
}

