import React from 'react';
import { Product } from '../../types/product';

interface CompareSpecRowProps {
  label: string;
  value1?: string | number | boolean;
  value2?: string | number | boolean;
  key?: React.Key;
}

export const CompareSpecRow = ({ label, value1, value2 }: CompareSpecRowProps) => {
  const renderValue = (val?: string | number | boolean) => {
    if (val === undefined || val === null) return <span className="text-zinc-400 italic">N/A</span>;
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return val;
  };

  return (
    <div className="grid grid-cols-3 gap-8 py-4 border-b border-zinc-100 items-center">
      <div className="col-span-1 text-sm font-semibold text-zinc-900 uppercase tracking-wider">
        {label}
      </div>
      <div className="col-span-1 text-sm text-zinc-600">
        {renderValue(value1)}
      </div>
      <div className="col-span-1 text-sm text-zinc-600">
        {renderValue(value2)}
      </div>
    </div>
  );
};
