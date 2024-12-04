import { ProfileGroupsState, ProfileGroupsAction } from '../types/profileGroups';

export const initialState: ProfileGroupsState = {
  individuals: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
  groups: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
};

export function profileGroupsReducer(
  state: ProfileGroupsState = initialState,
  action: ProfileGroupsAction
): ProfileGroupsState {
  switch (action.type) {
    case 'FETCH_INDIVIDUALS_START':
      return {
        ...state,
        individuals: {
          ...state.individuals,
          loading: true,
          error: null,
        },
      };

    case 'FETCH_INDIVIDUALS_SUCCESS':
      return {
        ...state,
        individuals: {
          data: action.payload,
          loading: false,
          error: null,
          lastFetched: Date.now(),
        },
      };

    case 'FETCH_INDIVIDUALS_ERROR':
      return {
        ...state,
        individuals: {
          ...state.individuals,
          loading: false,
          error: action.payload,
        },
      };

    case 'ADD_INDIVIDUAL':
      return {
        ...state,
        individuals: {
          ...state.individuals,
          data: [...state.individuals.data, action.payload],
        },
      };

    case 'REMOVE_INDIVIDUAL':
      return {
        ...state,
        individuals: {
          ...state.individuals,
          data: state.individuals.data.filter(
            (individual) => individual.id !== action.payload
          ),
        },
      };

    case 'FETCH_GROUPS_START':
      return {
        ...state,
        groups: {
          ...state.groups,
          loading: true,
          error: null,
        },
      };

    case 'FETCH_GROUPS_SUCCESS':
      return {
        ...state,
        groups: {
          data: action.payload,
          loading: false,
          error: null,
          lastFetched: Date.now(),
        },
      };

    case 'FETCH_GROUPS_ERROR':
      return {
        ...state,
        groups: {
          ...state.groups,
          loading: false,
          error: action.payload,
        },
      };

    case 'ADD_GROUP':
      return {
        ...state,
        groups: {
          ...state.groups,
          data: [...state.groups.data, action.payload],
        },
      };

    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: {
          ...state.groups,
          data: state.groups.data.map((group) =>
            group.id === action.payload.id ? action.payload : group
          ),
        },
      };

    case 'REMOVE_GROUP':
      return {
        ...state,
        groups: {
          ...state.groups,
          data: state.groups.data.filter((group) => group.id !== action.payload),
        },
      };

    default:
      return state;
  }
}
