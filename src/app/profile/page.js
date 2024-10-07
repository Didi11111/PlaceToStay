'use client';

import React from 'react';
import UserBookings from './components/UserBookings';

const ProfilePage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <UserBookings />
    </div>
  );
};

export default ProfilePage;
