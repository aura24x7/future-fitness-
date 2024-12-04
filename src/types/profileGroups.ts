export interface User {
  id: string;
  name: string;
  email: string;
  last_active?: string;
  profile_image?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  owner_id: string;
  members: User[];
}

export interface ProfileGroupsState {
  individuals: {
    data: User[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
  };
  groups: {
    data: Group[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
  };
}

export type ProfileGroupsAction =
  | { type: 'FETCH_INDIVIDUALS_START' }
  | { type: 'FETCH_INDIVIDUALS_SUCCESS'; payload: User[] }
  | { type: 'FETCH_INDIVIDUALS_ERROR'; payload: string }
  | { type: 'ADD_INDIVIDUAL'; payload: User }
  | { type: 'REMOVE_INDIVIDUAL'; payload: string }
  | { type: 'FETCH_GROUPS_START' }
  | { type: 'FETCH_GROUPS_SUCCESS'; payload: Group[] }
  | { type: 'FETCH_GROUPS_ERROR'; payload: string }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'UPDATE_GROUP'; payload: Group }
  | { type: 'REMOVE_GROUP'; payload: string };
