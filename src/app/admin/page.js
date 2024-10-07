'use client';

import React, { useState, useEffect } from 'react';
import AddPlace from './components/AddPlace';
import ManageBookings from './components/ManageBookings';
import EditPlace from './components/EditPlace';
import DeletePlace from './components/DeletePlace';
import Modal from '../components/Modal';
import AdminCard from './components/AdminCard'; 
import { UserAuth } from '../auth/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, isAdmin } = UserAuth();
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);

  // Redirect non-admin users
  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/'); 
    }
  }, [user, isAdmin, router]);

  // Function to open a modal with a specific component
  const openModal = (component) => {
    setActiveComponent(component);
    setModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalOpen(false);
    setActiveComponent(null);
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <main className="bg-gray-50 min-h-screen pt-24 p-8"> 
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <AdminCard 
          title="Add a New Place" 
          description="Add new accommodations to the platform."
          onClick={() => openModal(<AddPlace />)}
        />
        <AdminCard 
          title="Manage Bookings" 
          description="View and manage all user bookings."
          onClick={() => openModal(<ManageBookings />)}
        />
        <AdminCard 
          title="Edit a Place" 
          description="Edit the details of existing places."
          onClick={() => openModal(<EditPlace />)}
        />
        <AdminCard 
          title="Delete a Place" 
          description="Remove places from the platform."
          onClick={() => openModal(<DeletePlace />)}
        />
      </section>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {activeComponent}
      </Modal>
    </main>
  );
}
