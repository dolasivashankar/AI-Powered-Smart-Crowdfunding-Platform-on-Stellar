import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../ui/Card';

export const DonationChart: React.FC = () => {
  // Hardcoded last 7 days donation data for visual chart aesthetics
  const data = [
    { name: 'Mon', value: 400, amount: 4000 },
    { name: 'Tue', value: 650, amount: 6500 },
    { name: 'Wed', value: 500, amount: 5000 },
    { name: 'Thu', value: 980, amount: 9800 },
    { name: 'Fri', value: 720, amount: 7200 },
    { name: 'Sat', value: 1200, amount: 12000 },
    { name: 'Sun', value: 1540, amount: 15400 },
  ];

  return (
    <Card hoverEffect={false} className="flex flex-col gap-4 shadow-glow shadow-stellar-500/5">
      <div>
        <h4 className="text-sm font-bold text-slate-200">XLM Pledges Flow</h4>
        <p className="text-[10px] text-slate-500 font-semibold uppercase">Daily donation volumes</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '11px',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#a5bcfc' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default DonationChart;
