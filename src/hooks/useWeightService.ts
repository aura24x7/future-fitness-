import { useState, useEffect } from 'react';
import { WeightChartConfig, WeightChartData, WeightGoal } from '../types/weight';
import { weightService } from '../services/weightService';
import { subDays, subMonths, subYears, startOfDay } from 'date-fns';

export const useWeightService = (timeRange: WeightChartConfig['timeRange']) => {
  const [data, setData] = useState<WeightChartData[]>([]);
  const [weightGoal, setWeightGoal] = useState<WeightGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const endDate = startOfDay(new Date());
        let startDate = new Date(endDate);

        switch (timeRange) {
          case 'week':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case 'twoMonths':
            startDate.setDate(endDate.getDate() - 60);
            break;
          case 'sixMonths':
            startDate.setMonth(endDate.getMonth() - 6);
            break;
        }

        const goal = await weightService.getWeightGoal();
        setWeightGoal(goal);

        const chartData = await weightService.getChartData({
          startDate,
          endDate,
          timeRange
        });

        setData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch weight data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return { data, isLoading, error, weightGoal };
}; 