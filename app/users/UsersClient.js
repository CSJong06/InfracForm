"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function UsersClient({ session }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const router = useRouter();

  const isAdmin = session?.isAdmin;

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreated = (newUser) => {
    setUsers([...users, newUser]);
  };

  const handleEditUser = async (userData) => {
    try {
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      setEditingUser(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAdminToggle = async (userId, isAdmin) => {
    setUpdatingUser(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user role');
      }

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdatingUser(null);
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-10 space-y-10 pb-20">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                {!isAdmin && (
                  <p className="mt-1 text-sm text-gray-500">
                    View-only mode. Admin access required for user management.
                  </p>
                )}
              </div>
              {isAdmin && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create User
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : error ? (
              <div className="text-red-500 py-4">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr 
                        key={user._id} 
                        className={`hover:bg-gray-50 ${
                          user.email === session.email 
                            ? 'bg-blue-50 border-l-4 border-blue-500' 
                            : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.email === session.email && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isAdmin ? (
                            <div className="flex items-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={user.isAdmin}
                                  onChange={(e) => handleAdminToggle(user._id, e.target.checked)}
                                  disabled={updatingUser === user._id || user.email === session.email}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${updatingUser === user._id ? 'opacity-50' : ''}`}></div>
                              </label>
                              {updatingUser === user._id && (
                                <span className="ml-2 text-sm text-gray-500">Updating...</span>
                              )}
                            </div>
                          ) : (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {user.isAdmin ? 'Admin' : 'User'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => setEditingUser(user)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                disabled={user.email === session.email}
                                className={`text-red-600 hover:text-red-900 ${
                                  user.email === session.email ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      {isAdmin && (
        <>
          <CreateUserModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onUserCreated={handleUserCreated}
          />
          {editingUser && (
            <EditUserModal
              user={editingUser}
              onClose={() => setEditingUser(null)}
              onSave={handleEditUser}
            />
          )}
        </>
      )}
    </div>
  );
} 