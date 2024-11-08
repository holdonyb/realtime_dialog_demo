import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { studentRecords } from '../utils/dummy_data';

ChartJS.register(...registerables);

interface ChartProps {
  type: 'bar' | 'pie' | 'line';
  data: any;
  options?: any;
}

export const DataVisualization = ({ type, data, options }: ChartProps) => {
  const chartComponents = {
    bar: Bar,
    pie: Pie,
    line: Line,
  };

  const ChartComponent = chartComponents[type];
  return <ChartComponent data={data} options={options} />;
}; 