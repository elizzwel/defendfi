'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useEffect, useState } from 'react';
import type { TokenAllocation } from '@/lib/risk/types';
import { formatUsd } from '@/lib/utils';

interface AllocationPieProps {
  data: TokenAllocation[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TokenAllocation }>;
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div
        className="rounded-xl px-3 py-2.5 shadow-xl"
        style={{
          background: 'var(--chart-tooltip-bg)',
          border: '1px solid var(--chart-tooltip-border)',
          animation: 'fadeIn 100ms ease',
        }}
      >
        <p style={{ color: 'var(--text-primary)' }} className="text-[13px] font-semibold">{item.symbol}</p>
        <p style={{ color: 'var(--text-secondary)' }} className="text-[12px] mt-0.5">{formatUsd(item.usdValue)}</p>
        <p style={{ color: 'var(--text-muted)' }} className="text-[11px] mt-0.5">{item.percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) => {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-3">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span style={{ color: 'var(--text-muted)' }} className="text-[11px]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function AllocationPie({ data }: AllocationPieProps) {
  const [mounted, setMounted] = useState(false);
  // Read chart axis color from CSS var at mount time
  const [axisColor, setAxisColor] = useState('#52525B');

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--chart-axis')
      .trim();
    if (color) setAxisColor(color);

    // Re-read when theme changes
    const observer = new MutationObserver(() => {
      const c = getComputedStyle(document.documentElement)
        .getPropertyValue('--chart-axis')
        .trim();
      if (c) setAxisColor(c);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p style={{ color: 'var(--text-muted)' }} className="text-[13px]">No allocation data</p>
      </div>
    );
  }

  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'scale(0.98)',
        transition: 'opacity 300ms ease, transform 300ms ease',
      }}
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="usdValue"
            nameKey="symbol"
            strokeWidth={0}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ outline: 'none' }}
          />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
