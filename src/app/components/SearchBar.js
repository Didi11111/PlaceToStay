import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchType, setSearchType] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const handleSearch = () => {
    // Convert both search inputs to lowercase before passing them
    onSearch(searchType, searchCity);
  };

  return (
    <div className="mb-8">
      <input
        type="text"
        placeholder="Type (e.g., Hotel, Hostel)"
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 mr-4"
      />
      <input
        type="text"
        placeholder="City"
        value={searchCity}
        onChange={(e) => setSearchCity(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-4 hover:bg-blue-600 transition-colors duration-300"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
