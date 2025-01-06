import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  full_name: string;
  companies?: Company[];
}

interface Company {
  id: number;
  name: string;
  description: string;
  location: string;
  image: string;
  workingHours: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    username: '',
    password: '',
    email: '',
    full_name: '',
  });
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          user_companies (
            company_id
          )
        `);

      if (userError) throw userError;

      // Fetch companies for each user
      const usersWithCompanies = await Promise.all(
        (userData || []).map(async (user) => {
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .in(
              'id',
              user.user_companies?.map((uc: any) => uc.company_id) || []
            );
          return {
            ...user,
            companies: companyData || [],
          };
        })
      );

      setUsers(usersWithCompanies);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Insert new user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (userError) throw userError;

      // Insert user-company relationships
      if (selectedCompanies.length > 0) {
        const { error: relationError } = await supabase
          .from('user_companies')
          .insert(
            selectedCompanies.map((companyId) => ({
              user_id: userData.id,
              company_id: companyId,
            }))
          );

        if (relationError) throw relationError;
      }

      // Reset form
      setNewUser({
        username: '',
        password: '',
        email: '',
        full_name: '',
      });
      setSelectedCompanies([]);

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCompanySelection = (companyId: number) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New User</h2>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              value={newUser.full_name}
              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Companies
            </label>
            <div className="grid grid-cols-2 gap-4">
              {companies.map((company) => (
                <label
                  key={company.id}
                  className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company.id)}
                    onChange={() => handleCompanySelection(company.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{company.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </form>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Users</h3>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="border rounded-lg p-4 flex items-start justify-between"
              >
                <div>
                  <h4 className="text-lg font-medium">{user.full_name}</h4>
                  <p className="text-gray-500 mt-1">{user.email}</p>
                  <p className="text-sm text-gray-600 mt-2">Username: {user.username}</p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Assigned Companies:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.companies?.map((company) => (
                        <span
                          key={company.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {company.name}
                        </span>
                      ))}
                      {(!user.companies || user.companies.length === 0) && (
                        <span className="text-sm text-gray-500">No companies assigned</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => user.id && handleDeleteUser(user.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-gray-500 text-center py-4">No users added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}