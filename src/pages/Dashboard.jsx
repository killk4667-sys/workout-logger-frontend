import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Activity, Dumbbell, Calendar, Target } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [chartUrl, setChartUrl] = useState(''); // <-- ADD THIS
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setSummary(res.data.data);

        // Abdelrahman's External API Integration: QuickChart
        const volumeRes = await api.get('/analytics/volume/weekly?weeks=4');
        const labels = volumeRes.data.data.map(d => d.label);
        const data = volumeRes.data.data.map(d => d.totalVolume);
        
        // Build the chart configuration
        const chartConfig = {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{ label: 'Weekly Volume (kg)', data: data, backgroundColor: 'rgba(37, 99, 235, 0.8)' }]
          }
        };
        // Encode it into the QuickChart URL
        setChartUrl(`https://quickchart.io/chart?w=600&h=300&c=${encodeURIComponent(JSON.stringify(chartConfig))}`);

      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="mt-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Progress Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Dumbbell size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-800">{summary?.totalSessions || 0}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full"><Calendar size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Last 30 Days</p>
            <p className="text-2xl font-bold text-gray-800">{summary?.sessionsLast30Days || 0}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><Activity size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Total Volume</p>
            <p className="text-2xl font-bold text-gray-800">{summary?.totalVolumeLifted || 0} kg</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><Target size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Unique Exercises</p>
            <p className="text-2xl font-bold text-gray-800">{summary?.uniqueExercisesUsed || 0}</p>
          </div>
        </div>
      </div>

      {/* Abdelrahman's QuickChart API Rendering */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4 w-full text-left">Recent Training Volume</h2>
        {chartUrl ? (
          <img src={chartUrl} alt="Weekly Volume Chart" className="max-w-full h-auto rounded" />
        ) : (
          <p className="text-gray-400 italic">No workout data available to chart yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;