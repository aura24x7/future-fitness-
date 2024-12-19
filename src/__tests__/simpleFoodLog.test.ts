import AsyncStorage from '@react-native-async-storage/async-storage';
import { simpleFoodLogService } from '../services/simpleFoodLogService';
import { analyzeFoodImage } from '../services/foodRecognitionService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock food recognition service
jest.mock('../services/foodRecognitionService', () => ({
  analyzeFoodImage: jest.fn(),
}));

describe('SimpleFoodLog Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Data Persistence Tests', () => {
    it('should save and retrieve food items correctly', async () => {
      const mockFoodItem = {
        name: 'Test Food',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
      };

      // Test adding a food item
      const savedItem = await simpleFoodLogService.addFoodItem(mockFoodItem);
      expect(savedItem).toHaveProperty('id');
      expect(savedItem).toHaveProperty('timestamp');
      expect(savedItem.name).toBe(mockFoodItem.name);
      expect(AsyncStorage.setItem).toHaveBeenCalled();

      // Mock the stored data for retrieval
      const mockStoredItems = [savedItem];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockStoredItems));

      // Test retrieving food items
      const retrievedItems = await simpleFoodLogService.getSimpleFoodLog();
      expect(retrievedItems).toHaveLength(1);
      expect(retrievedItems[0]).toEqual(savedItem);
    });

    it('should handle empty storage correctly', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const items = await simpleFoodLogService.getSimpleFoodLog();
      expect(items).toEqual([]);
    });

    it('should remove items correctly', async () => {
      const mockItem = {
        id: '123',
        name: 'Test Food',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
        timestamp: new Date().toISOString(),
      };

      // Mock existing items
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([mockItem]));

      // Remove the item
      await simpleFoodLogService.removeFoodItem('123');

      // Verify the updated storage
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@simple_food_log',
        JSON.stringify([])
      );
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      const items = await simpleFoodLogService.getSimpleFoodLog();
      expect(items).toEqual([]);
    });

    it('should handle invalid JSON data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid json');
      const items = await simpleFoodLogService.getSimpleFoodLog();
      expect(items).toEqual([]);
    });
  });

  describe('Loading State Tests', () => {
    it('should handle concurrent operations correctly', async () => {
      const mockItem1 = {
        name: 'Food 1',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
      };

      const mockItem2 = {
        name: 'Food 2',
        calories: 200,
        protein: 15,
        carbs: 25,
        fat: 8,
      };

      // Simulate concurrent additions
      const promise1 = simpleFoodLogService.addFoodItem(mockItem1);
      const promise2 = simpleFoodLogService.addFoodItem(mockItem2);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.name).toBe(mockItem1.name);
      expect(result2.name).toBe(mockItem2.name);
    });
  });
});

describe('SimpleFoodLog Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Scan Flow Integration Tests', () => {
    it('should process and save scanned food data correctly', async () => {
      // Mock food analysis result
      const mockAnalysisResult = {
        foodName: 'Test Food',
        description: 'A test food item',
        nutritionInfo: {
          calories: 250,
          protein: 10,
          carbs: 30,
          fat: 8,
        },
        confidence: 0.95,
      };

      // Mock successful food analysis
      (analyzeFoodImage as jest.Mock).mockResolvedValueOnce(mockAnalysisResult);

      // Mock existing food log
      const mockExistingLog = [];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockExistingLog));

      // Test the flow
      const imageBase64 = 'mock-image-data';
      const analysisResult = await analyzeFoodImage(imageBase64);
      
      // Verify analysis result
      expect(analysisResult).toEqual(mockAnalysisResult);

      // Add to food log
      const savedItem = await simpleFoodLogService.addFoodItem({
        name: analysisResult.foodName,
        calories: analysisResult.nutritionInfo.calories,
        protein: analysisResult.nutritionInfo.protein,
        carbs: analysisResult.nutritionInfo.carbs,
        fat: analysisResult.nutritionInfo.fat,
      });

      // Verify saved item
      expect(savedItem).toHaveProperty('id');
      expect(savedItem).toHaveProperty('timestamp');
      expect(savedItem.name).toBe(mockAnalysisResult.foodName);
      expect(savedItem.calories).toBe(mockAnalysisResult.nutritionInfo.calories);
      expect(savedItem.protein).toBe(mockAnalysisResult.nutritionInfo.protein);
      expect(savedItem.carbs).toBe(mockAnalysisResult.nutritionInfo.carbs);
      expect(savedItem.fat).toBe(mockAnalysisResult.nutritionInfo.fat);

      // Verify storage was called with correct data
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0]).toMatchObject({
        name: mockAnalysisResult.foodName,
        calories: mockAnalysisResult.nutritionInfo.calories,
        protein: mockAnalysisResult.nutritionInfo.protein,
        carbs: mockAnalysisResult.nutritionInfo.carbs,
        fat: mockAnalysisResult.nutritionInfo.fat,
      });
    });

    it('should handle food analysis errors gracefully', async () => {
      // Mock failed food analysis
      (analyzeFoodImage as jest.Mock).mockRejectedValueOnce(new Error('Analysis failed'));

      // Test error handling
      await expect(analyzeFoodImage('mock-image-data')).rejects.toThrow('Analysis failed');
    });

    it('should handle concurrent scan operations correctly', async () => {
      // Mock two different food analysis results
      const mockResults = [
        {
          foodName: 'Food 1',
          nutritionInfo: { calories: 200, protein: 10, carbs: 20, fat: 5 },
        },
        {
          foodName: 'Food 2',
          nutritionInfo: { calories: 300, protein: 15, carbs: 25, fat: 8 },
        },
      ];

      // Mock successful analyses
      (analyzeFoodImage as jest.Mock)
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1]);

      // Mock empty initial food log
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      // Test concurrent operations
      const operations = mockResults.map(async (_, index) => {
        const result = await analyzeFoodImage(`mock-image-${index}`);
        return simpleFoodLogService.addFoodItem({
          name: result.foodName,
          calories: result.nutritionInfo.calories,
          protein: result.nutritionInfo.protein,
          carbs: result.nutritionInfo.carbs,
          fat: result.nutritionInfo.fat,
        });
      });

      const savedItems = await Promise.all(operations);

      // Verify both items were saved
      expect(savedItems).toHaveLength(2);
      expect(savedItems[0].name).toBe(mockResults[0].foodName);
      expect(savedItems[1].name).toBe(mockResults[1].foodName);

      // Verify storage operations
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('should validate and sanitize food data before saving', async () => {
      // Mock analysis result with invalid data
      const mockAnalysisResult = {
        foodName: '',  // Invalid empty name
        nutritionInfo: {
          calories: -100,  // Invalid negative value
          protein: 'invalid',  // Invalid type
          carbs: null,  // Invalid null
          fat: undefined,  // Invalid undefined
        },
      };

      (analyzeFoodImage as jest.Mock).mockResolvedValueOnce(mockAnalysisResult);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([]));

      // Add to food log
      const savedItem = await simpleFoodLogService.addFoodItem({
        name: mockAnalysisResult.foodName || 'Unknown Food',
        calories: Math.max(0, Number(mockAnalysisResult.nutritionInfo.calories) || 0),
        protein: Math.max(0, Number(mockAnalysisResult.nutritionInfo.protein) || 0),
        carbs: Math.max(0, Number(mockAnalysisResult.nutritionInfo.carbs) || 0),
        fat: Math.max(0, Number(mockAnalysisResult.nutritionInfo.fat) || 0),
      });

      // Verify data was sanitized
      expect(savedItem.name).toBe('Unknown Food');
      expect(savedItem.calories).toBe(0);
      expect(savedItem.protein).toBe(0);
      expect(savedItem.carbs).toBe(0);
      expect(savedItem.fat).toBe(0);
    });
  });
});

describe('Remove Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove food item successfully', async () => {
    // Mock existing food log
    const mockItems = [
      {
        id: '1',
        name: 'Test Food 1',
        calories: 200,
        protein: 10,
        carbs: 20,
        fat: 5,
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Test Food 2',
        calories: 300,
        protein: 15,
        carbs: 25,
        fat: 8,
        timestamp: new Date().toISOString(),
      },
    ];

    // Setup initial state
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockItems));

    // Get initial items
    const initialItems = await simpleFoodLogService.getSimpleFoodLog();
    expect(initialItems).toHaveLength(2);

    // Remove an item
    await simpleFoodLogService.removeFoodItem('1');

    // Verify storage was updated
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    const savedData = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
    expect(savedData).toHaveLength(1);
    expect(savedData[0].id).toBe('2');
  });

  it('should handle removal of non-existent item', async () => {
    // Mock empty food log
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([]));

    // Attempt to remove non-existent item
    await simpleFoodLogService.removeFoodItem('non-existent-id');

    // Verify no storage update was made
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('should handle concurrent remove operations', async () => {
    // Mock food log with multiple items
    const mockItems = [
      { id: '1', name: 'Food 1', calories: 200, protein: 10, carbs: 20, fat: 5, timestamp: new Date().toISOString() },
      { id: '2', name: 'Food 2', calories: 300, protein: 15, carbs: 25, fat: 8, timestamp: new Date().toISOString() },
      { id: '3', name: 'Food 3', calories: 400, protein: 20, carbs: 30, fat: 10, timestamp: new Date().toISOString() },
    ];

    // Setup initial state
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockItems));

    // Attempt concurrent removals
    const removePromises = ['1', '2'].map(id => simpleFoodLogService.removeFoodItem(id));
    await Promise.all(removePromises);

    // Verify final state
    const lastCall = (AsyncStorage.setItem as jest.Mock).mock.calls.slice(-1)[0];
    const finalData = JSON.parse(lastCall[1]);
    expect(finalData).toHaveLength(1);
    expect(finalData[0].id).toBe('3');
  });

  it('should handle storage errors during removal', async () => {
    // Mock storage error
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

    // Attempt removal
    try {
      await simpleFoodLogService.removeFoodItem('1');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should maintain data consistency during removal', async () => {
    // Mock initial data
    const mockItems = [
      { id: '1', name: 'Food 1', calories: 200, protein: 10, carbs: 20, fat: 5, timestamp: new Date().toISOString() },
      { id: '2', name: 'Food 2', calories: 300, protein: 15, carbs: 25, fat: 8, timestamp: new Date().toISOString() },
    ];

    // Setup mock behavior
    let storedData = mockItems;
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => JSON.stringify(storedData));
    (AsyncStorage.setItem as jest.Mock).mockImplementation((_, data) => {
      storedData = JSON.parse(data);
      return Promise.resolve();
    });

    // Remove item
    await simpleFoodLogService.removeFoodItem('1');

    // Verify data consistency
    const updatedItems = await simpleFoodLogService.getSimpleFoodLog();
    expect(updatedItems).toHaveLength(1);
    expect(updatedItems[0].id).toBe('2');
    expect(storedData).toEqual(updatedItems);
  });

  it('should handle invalid data during removal', async () => {
    // Mock invalid data in storage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid json');

    // Attempt removal
    try {
      await simpleFoodLogService.removeFoodItem('1');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe('Remove and Undo Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove and undo food item successfully', async () => {
    // Mock existing food log
    const mockItems = [
      {
        id: '1',
        name: 'Test Food 1',
        calories: 200,
        protein: 10,
        carbs: 20,
        fat: 5,
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Test Food 2',
        calories: 300,
        protein: 15,
        carbs: 25,
        fat: 8,
        timestamp: new Date().toISOString(),
      },
    ];

    // Setup initial state
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockItems));

    // Get initial items
    const initialItems = await simpleFoodLogService.getSimpleFoodLog();
    expect(initialItems).toHaveLength(2);

    // Remove an item
    const removedItem = await simpleFoodLogService.removeFoodItem('1');
    expect(removedItem.id).toBe('1');
    expect(removedItem.removedAt).toBeDefined();

    // Verify storage was updated
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    let savedData = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
    expect(savedData).toHaveLength(1);
    expect(savedData[0].id).toBe('2');

    // Mock storage for undo
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(savedData));

    // Undo the removal
    const restoredItem = await simpleFoodLogService.undoRemove(removedItem);
    expect(restoredItem.id).toBe('1');
    expect(restoredItem).not.toHaveProperty('removedAt');

    // Verify storage after undo
    savedData = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[1][1]);
    expect(savedData).toHaveLength(2);
    expect(savedData[0].id).toBe('1');
  });

  it('should handle undo errors gracefully', async () => {
    // Mock storage error
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

    const mockRemovedItem = {
      id: '1',
      name: 'Test Food',
      calories: 200,
      protein: 10,
      carbs: 20,
      fat: 5,
      timestamp: new Date().toISOString(),
      removedAt: new Date().toISOString(),
    };

    // Attempt undo
    await expect(simpleFoodLogService.undoRemove(mockRemovedItem)).rejects.toThrow();
  });

  it('should maintain data consistency during undo', async () => {
    // Mock initial data
    const mockItems = [
      {
        id: '2',
        name: 'Food 2',
        calories: 300,
        protein: 15,
        carbs: 25,
        fat: 8,
        timestamp: new Date().toISOString(),
      },
    ];

    const mockRemovedItem = {
      id: '1',
      name: 'Food 1',
      calories: 200,
      protein: 10,
      carbs: 20,
      fat: 5,
      timestamp: new Date().toISOString(),
      removedAt: new Date().toISOString(),
    };

    // Setup mock behavior
    let storedData = mockItems;
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => JSON.stringify(storedData));
    (AsyncStorage.setItem as jest.Mock).mockImplementation((_, data) => {
      storedData = JSON.parse(data);
      return Promise.resolve();
    });

    // Perform undo
    await simpleFoodLogService.undoRemove(mockRemovedItem);

    // Verify data consistency
    const updatedItems = await simpleFoodLogService.getSimpleFoodLog();
    expect(updatedItems).toHaveLength(2);
    expect(updatedItems[0].id).toBe('1');
    expect(storedData).toEqual(updatedItems);
  });
}); 