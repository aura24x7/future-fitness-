import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import { waterService } from '../services/waterService';

const WATER_AMOUNTS = [100, 200, 300, 500];

const TrackWaterScreen = ({ navigation }) => {
  const [todayTotal, setTodayTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayWater();
  }, []);

  const fetchTodayWater = async () => {
    try {
      const total = await waterService.getTodayWater();
      setTodayTotal(total);
    } catch (error) {
      console.error('Error fetching water data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async (amount) => {
    try {
      setLoading(true);
      const newTotal = await waterService.trackWater(amount);
      setTodayTotal(newTotal);
      Alert.alert('Success', 'Water intake tracked successfully!');
    } catch (error) {
      console.error('Error tracking water:', error);
      Alert.alert('Error', 'Failed to track water intake. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Track Water Intake</Text>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Today's Total:</Text>
          <Text style={styles.totalValue}>{todayTotal} ml</Text>
        </View>

        <View style={styles.buttonsContainer}>
          {WATER_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              title={`${amount} ml`}
              onPress={() => handleAddWater(amount)}
              style={styles.button}
              variant={amount === 500 ? 'primary' : 'outline'}
            />
          ))}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4c669f',
    marginTop: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
    marginBottom: 12,
  },
});

export default TrackWaterScreen;
