import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { SimpleFoodLogProvider, useSimpleFoodLog } from '../contexts/SimpleFoodLogContext';
import { simpleFoodLogService } from '../services/simpleFoodLogService';

// Mock the service
jest.mock('../services/simpleFoodLogService', () => ({
  simpleFoodLogService: {
    getSimpleFoodLog: jest.fn(),
    addFoodItem: jest.fn(),
    removeFoodItem: jest.fn(),
    clearFoodLog: jest.fn(),
  },
}));

// Test component that uses the context
const TestComponent = () => {
  const { items, isLoading, error, addFoodItem } = useSimpleFoodLog();
  return (
    <>
      {isLoading && <text testID="loading">Loading...</text>}
      {error && <text testID="error">{error}</text>}
      <text testID="items-count">{items.length}</text>
    </>
  );
};

describe('SimpleFoodLogContext Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load items on mount', async () => {
    const mockItems = [
      {
        id: '1',
        name: 'Test Food',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
        timestamp: new Date().toISOString(),
      },
    ];

    (simpleFoodLogService.getSimpleFoodLog as jest.Mock).mockResolvedValueOnce(mockItems);

    const { getByTestId } = render(
      <SimpleFoodLogProvider>
        <TestComponent />
      </SimpleFoodLogProvider>
    );

    // Should show loading initially
    expect(getByTestId('loading')).toBeTruthy();

    // Wait for items to load
    await waitFor(() => {
      expect(getByTestId('items-count').props.children).toBe(1);
    });
  });

  it('should handle errors gracefully', async () => {
    (simpleFoodLogService.getSimpleFoodLog as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to load')
    );

    const { getByTestId } = render(
      <SimpleFoodLogProvider>
        <TestComponent />
      </SimpleFoodLogProvider>
    );

    await waitFor(() => {
      expect(getByTestId('error')).toBeTruthy();
    });
  });

  it('should add items correctly', async () => {
    const mockItem = {
      name: 'New Food',
      calories: 150,
      protein: 12,
      carbs: 25,
      fat: 6,
    };

    const mockSavedItem = {
      ...mockItem,
      id: '2',
      timestamp: new Date().toISOString(),
    };

    (simpleFoodLogService.getSimpleFoodLog as jest.Mock).mockResolvedValueOnce([]);
    (simpleFoodLogService.addFoodItem as jest.Mock).mockResolvedValueOnce(mockSavedItem);

    const { getByTestId } = render(
      <SimpleFoodLogProvider>
        <TestComponent />
      </SimpleFoodLogProvider>
    );

    await waitFor(() => {
      expect(getByTestId('items-count').props.children).toBe(0);
    });

    // Add new item
    await act(async () => {
      const { addFoodItem } = useSimpleFoodLog();
      await addFoodItem(mockItem);
    });

    // Should update the items count
    await waitFor(() => {
      expect(getByTestId('items-count').props.children).toBe(1);
    });
  });

  it('should remove items correctly', async () => {
    const mockItems = [
      {
        id: '1',
        name: 'Test Food',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
        timestamp: new Date().toISOString(),
      },
    ];

    (simpleFoodLogService.getSimpleFoodLog as jest.Mock).mockResolvedValueOnce(mockItems);

    const { getByTestId } = render(
      <SimpleFoodLogProvider>
        <TestComponent />
      </SimpleFoodLogProvider>
    );

    await waitFor(() => {
      expect(getByTestId('items-count').props.children).toBe(1);
    });

    // Remove item
    await act(async () => {
      const { removeFoodItem } = useSimpleFoodLog();
      await removeFoodItem('1');
    });

    // Should update the items count
    await waitFor(() => {
      expect(getByTestId('items-count').props.children).toBe(0);
    });
  });
}); 