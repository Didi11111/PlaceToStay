'use client';

import React, { useState, useEffect } from 'react';

const Hero = ({ accommodations }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (accommodations.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === accommodations.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [accommodations]);

  const handleNextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === accommodations.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? accommodations.length - 1 : prevIndex - 1
    );
  };

  // Check if accommodations are available, else show a default hero message
  const hasAccommodations = accommodations && accommodations.length > 0;
  const currentAccommodation = hasAccommodations ? accommodations[currentIndex] : null;

  return (
    <section
      className="relative bg-cover bg-center h-96 mb-12"
      style={{
        backgroundImage: `url(${
          currentAccommodation?.image || 'https://source.unsplash.com/random/1920x1080?hotel'
        })`,
      }}
    >
      <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
        <div className="text-center text-white">
          {hasAccommodations ? (
            <>
              <h1 className="text-6xl font-extrabold mb-4">{currentAccommodation.name}</h1>
              <p className="text-lg">{currentAccommodation.location}</p>
            </>
          ) : (
            <>
              <h1 className="text-6xl font-extrabold mb-4">Find Your Perfect Stay</h1>
              <p className="text-lg">Explore our hand-picked accommodations around the world.</p>
            </>
          )}
        </div>
      </div>
      {hasAccommodations && (
        <>
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-black p-2 rounded-full opacity-50 hover:opacity-100"
          >
            ‹
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-black p-2 rounded-full opacity-50 hover:opacity-100"
          >
            ›
          </button>
        </>
      )}
    </section>
  );
};

export default Hero;
