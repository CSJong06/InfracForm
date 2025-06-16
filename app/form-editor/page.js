'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { useTypes } from '@/lib/hooks/useTypes';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import TypeFormModal from '../components/TypeFormModal';
import DeleteTypeModal from '../components/DeleteTypeModal';

export default function FormEditorPage() {
  const router = useRouter();
  const { interactionTypes, infractionTypes, interventionTypes, loading, error, refresh } = useTypes();
  const [isAdmin, setIsAdmin] = useState(false);
  const [openSection, setOpenSection] = useState(null); // Changed from 'interactions' to null
  
  // Modal states
  const [typeFormModal, setTypeFormModal] = useState({
    open: false,
    type: null,
    category: null
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: null,
    category: null
  });

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        if (!data?.isAdmin) {
          router.push('/dashboard');
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/dashboard');
      }
    };
    checkAdminStatus();
  }, [router]);

  const handleAddType = (category) => {
    setTypeFormModal({
      open: true,
      type: null,
      category
    });
  };

  const handleEditType = (type, category) => {
    setTypeFormModal({
      open: true,
      type,
      category
    });
  };

  const handleDeleteType = (type, category) => {
    setDeleteModal({
      open: true,
      type,
      category
    });
  };

  const handleTypeSave = () => {
    refresh();
  };

  const handleTypeDelete = () => {
    refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-10">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Error loading form options: {error}
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Form Editor</h1>
          </div>

          <div className="space-y-2">
            {/* Interaction Types Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setOpenSection(openSection === 'interactions' ? null : 'interactions')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium text-gray-900">Interaction Types</h2>
                  <span className="text-sm text-gray-500">({interactionTypes.length})</span>
                </div>
                <ChevronDownIcon 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openSection === 'interactions' ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              
              {openSection === 'interactions' && (
                <div className="px-4 pb-4">
                  <div className="flex justify-end mb-3">
                    <button 
                      onClick={() => handleAddType('interaction')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Type
                    </button>
                  </div>
                  <div className="space-y-2">
                    {interactionTypes.map((type) => (
                      <div key={type.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{type.displayName}</h3>
                          <p className="text-sm text-gray-500">{type.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditType(type, 'interaction')}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteType(type, 'interaction')}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Infraction Types Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setOpenSection(openSection === 'infractions' ? null : 'infractions')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium text-gray-900">Infraction Types</h2>
                  <span className="text-sm text-gray-500">({infractionTypes.length})</span>
                </div>
                <ChevronDownIcon 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openSection === 'infractions' ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              
              {openSection === 'infractions' && (
                <div className="px-4 pb-4">
                  <div className="flex justify-end mb-3">
                    <button 
                      onClick={() => handleAddType('infraction')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Type
                    </button>
                  </div>
                  <div className="space-y-2">
                    {infractionTypes.map((type) => (
                      <div key={type.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{type.displayName}</h3>
                          <p className="text-sm text-gray-500">{type.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditType(type, 'infraction')}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteType(type, 'infraction')}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Intervention Types Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setOpenSection(openSection === 'interventions' ? null : 'interventions')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium text-gray-900">Intervention Types</h2>
                  <span className="text-sm text-gray-500">({interventionTypes.length})</span>
                </div>
                <ChevronDownIcon 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openSection === 'interventions' ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              
              {openSection === 'interventions' && (
                <div className="px-4 pb-4">
                  <div className="flex justify-end mb-3">
                    <button 
                      onClick={() => handleAddType('intervention')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Type
                    </button>
                  </div>
                  <div className="space-y-2">
                    {interventionTypes.map((type) => (
                      <div key={type.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{type.displayName}</h3>
                          <p className="text-sm text-gray-500">{type.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditType(type, 'intervention')}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteType(type, 'intervention')}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Type Form Modal */}
      {typeFormModal.open && (
        <TypeFormModal
          open={typeFormModal.open}
          onClose={() => setTypeFormModal({ open: false, type: null, category: null })}
          type={typeFormModal.type}
          typeCategory={typeFormModal.category}
          onSave={handleTypeSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <DeleteTypeModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, type: null, category: null })}
          type={deleteModal.type}
          typeCategory={deleteModal.category}
          onDelete={handleTypeDelete}
        />
      )}
    </div>
  );
} 