import React from 'react';
import { Product } from '../../types';
import { formatFCFA } from '../../utils/security';

interface AdminStatsTabProps {
  totalRevenue: number;
  totalYassRevenue: number;
  totalFloozRevenue: number;
  products: Product[];
  lowStockCount: number;
}

export const AdminStatsTab: React.FC<AdminStatsTabProps> = ({
  totalRevenue,
  totalYassRevenue,
  totalFloozRevenue,
  products,
  lowStockCount
}) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Chiffre d'Affaires Encaissé
          </span>
          <div className="text-2xl font-black text-amber-600">
            {formatFCFA(totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            100% encaissé via Mobile Money
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Volume T-Money (Yass)
          </span>
          <div className="text-xl font-bold text-slate-900">
            {formatFCFA(totalYassRevenue)}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
            Réseau Yas Togo (*145#)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Volume Moov Flooz
          </span>
          <div className="text-xl font-bold text-slate-900">
            {formatFCFA(totalFloozRevenue)}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            Réseau Moov Africa (*155#)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Total Articles
          </span>
          <div className="text-2xl font-black text-slate-900">
            {products.length}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            {lowStockCount > 0 ? `${lowStockCount} article(s) stock bas` : 'Stock optimal'}
          </span>
        </div>
      </div>

      {/* Breakdown overview */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900">
          Performance des Paiements Mobile Money au Togo
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>T-Money (Yass)</span>
              <span>
                {totalRevenue > 0 ? Math.round((totalYassRevenue / totalRevenue) * 100) : 50}% ({formatFCFA(totalYassRevenue)})
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${totalRevenue > 0 ? (totalYassRevenue / totalRevenue) * 100 : 50}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Moov Flooz</span>
              <span>
                {totalRevenue > 0 ? Math.round((totalFloozRevenue / totalRevenue) * 100) : 50}% ({formatFCFA(totalFloozRevenue)})
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${totalRevenue > 0 ? (totalFloozRevenue / totalRevenue) * 100 : 50}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
