'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useEffect, useState } from 'react';
import type { ChainDistribution } from '@/lib/risk/types';
import { formatUsd } from '@/lib/utils';

interface ChainBarProps {
  data: ChainDistribution[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-3 py-2.5 shadow-xl"
        style={{
          background: 'var(--chart-tooltip-bg)',
          border: '1px solid var(--chart-tooltip-border)',
          animation: 'fadeIn 100ms ease',
        }}
      >
        <p style={{ color: 'var(--text-primary)' }} className="text-[13px] font-semibold">{label}</p>
        <p style={{ color: 'var(--text-secondary)' }} className="text-[12px] mt-0.5">{formatUsd(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export function ChainBar({ data }: ChainBarProps) {
  const [mounted, setMounted] = useState(false);
  const [axisColor, setAxisColor] = useState('#52525B');

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const readColor = () => {
      const c = getComputedStyle(document.documentElement)
        .getPropertyValue('--chart-axis')
        .trim();
      if (c) setAxisColor(c);
    };
    readColor();

    // Re-read when theme class changes
    const observer = new MutationObserver(readColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p style={{ color: 'var(--text-muted)' }} className="text-[13px]">No chain data</p>
      </div>
    );
  }

  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(4px)',
        transition: 'opacity 300ms ease, transform 300ms ease',
      }}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          barSize={28}
        >
          <XAxis
            dataKey="chainName"
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 11 }}
            tickFormatter={(v) => formatUsd(v, true)}
            width={60}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'var(--chart-cursor)' }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar
            dataKey="usdValue"
            radius={[5, 5, 0, 0]}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
