// TODO: Uncomment when Supabase is configured
// import { supabase } from '../lib/supabase';

// Mock data for development
const mockUsers = [
  {
    id: '1',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    last_active: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    last_active: new Date().toISOString(),
  },
];

class UserService {
  async findUserById(userId: string) {
    try {
      const user = mockUsers.find(u => u.id === userId);
      return user || null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return {
        id: '0',
        name: 'Current User',
        email: 'current@example.com',
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  async getConnections() {
    try {
      return mockUsers;
    } catch (error) {
      console.error('Error getting connections:', error);
      throw error;
    }
  }

  async addConnection(userId: string) {
    try {
      console.log('Connection added with user:', userId);
      return true;
    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
