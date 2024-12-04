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
      // Mock implementation
      const user = mockUsers.find(u => u.id === userId);
      return user || null;

      // TODO: Uncomment when Supabase is configured
      // const { data, error } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('id', userId)
      //   .single();
      // if (error) throw error;
      // return data;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  async addConnection(userId: string) {
    try {
      // Mock implementation
      console.log('Connection added with user:', userId);
      return true;

      // TODO: Uncomment when Supabase is configured
      // const currentUser = await this.getCurrentUser();
      // if (!currentUser) throw new Error('No authenticated user');
      // const { error } = await supabase
      //   .from('connections')
      //   .insert([
      //     {
      //       user_id: currentUser.id,
      //       connected_user_id: userId,
      //       status: 'connected'
      //     }
      //   ]);
      // if (error) throw error;
    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      // Mock implementation
      return {
        id: '0',
        name: 'Current User',
        email: 'current@example.com',
      };

      // TODO: Uncomment when Supabase is configured
      // const { data: { user }, error } = await supabase.auth.getUser();
      // if (error) throw error;
      // return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  async getConnections() {
    try {
      // Mock implementation
      return mockUsers;

      // TODO: Uncomment when Supabase is configured
      // const currentUser = await this.getCurrentUser();
      // if (!currentUser) throw new Error('No authenticated user');
      // const { data, error } = await supabase
      //   .from('connections')
      //   .select(`
      //     connected_user_id,
      //     connected_user:users!connected_user_id(*)
      //   `)
      //   .eq('user_id', currentUser.id)
      //   .eq('status', 'connected');
      // if (error) throw error;
      // return data.map(connection => connection.connected_user);
    } catch (error) {
      console.error('Error getting connections:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
