import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartData } from '../../types/qurban';

interface AnalyticsChartsProps {
  chartData: any; // Will be properly typed when connected to real data
  loading: boolean;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ chartData, loading }) => {
  // Mock data for demonstration
  const topKabupatenData = [
    { name: 'Jakarta Pusat', penerima: 450, hewan: 85 },
    { name: 'Surabaya', penerima: 320, hewan: 62 },
    { name: 'Bandung', penerima: 280, hewan: 48 },
    { name: 'Medan', penerima: 190, hewan: 35 },
    { name: 'Makassar', penerima: 150, hewan: 28 },
  ];

  const dailyProgressData = [
    { date: '14 Jun', muzakki: 120, distribusi: 85 },
    { date: '15 Jun', muzakki: 180, distribusi: 125 },
    { date: '16 Jun', muzakki: 240, distribusi: 210 },
    { date: '17 Jun', muzakki: 280, distribusi: 265 },
    { date: '18 Jun', muzakki: 320, distribusi: 295 },
    { date: '19 Jun', muzakki: 350, distribusi: 340 },
    { date: '20 Jun', muzakki: 380, distribusi: 370 },
  ];

  const jenisHewanData = [
    { name: 'Sapi', value: 45, color: '#3B82F6' },
    { name: 'Kambing', value: 35, color: '#10B981' },
    { name: 'Domba', value: 20, color: '#F59E0B' },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Kabupaten Bar Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 5 Kabupaten Penerima Manfaat
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topKabupatenData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="penerima" fill="#3B82F6" name="Penerima" />
              <Bar dataKey="hewan" fill="#10B981" name="Hewan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Progress Line Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Perkembangan Harian Muzakki & Distribusi
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="muzakki" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Muzakki"
              />
              <Line 
                type="monotone" 
                dataKey="distribusi" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Distribusi"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Animal Types Pie Chart */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribusi Jenis Hewan
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jenisHewanData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {jenisHewanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ringkasan Distribusi
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">Total Penerima Hari Ini</span>
                <span className="text-2xl font-bold text-blue-900">1,247</span>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-green-700 font-medium">Hewan Didistribusikan</span>
                <span className="text-2xl font-bold text-green-900">89</span>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-purple-700 font-medium">Mitra Aktif</span>
                <span className="text-2xl font-bold text-purple-900">12</span>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-orange-700 font-medium">Efisiensi Distribusi</span>
                <span className="text-2xl font-bold text-orange-900">94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts; 