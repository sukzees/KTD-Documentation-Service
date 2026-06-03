
import React, { useState, useContext } from 'react';
import { Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Highlight } from '../../frontend/components';
import { LanguageContext } from "../../contexts/AppContext";
import { TRANSLATIONS } from "../../translations";

interface LeadsTabProps {
  leads: any[];
  searchQuery: string;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  handleDelete: (table: string, id: string) => void;
  canManage: boolean;
}

export function LeadsTab({ leads, searchQuery, selectedIds, toggleSelect, toggleSelectAll, handleDelete, canManage }: LeadsTabProps) {
  const context = useContext(LanguageContext);
  const t = context?.t || TRANSLATIONS.en;
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLeads = leads.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-50/50 dark:bg-neutral-900/50">
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <th className="px-8 py-4 w-10">
                {canManage && (
                  <input 
                    type="checkbox" 
                    checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                )}
              </th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.customer}</th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{t.backend.fields.contact}</th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{t.backend.fields.message}</th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{t.backend.fields.date}</th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">{t.backend.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {paginatedLeads.map(lead => (
              <tr key={lead.id} className={`hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors ${selectedIds.includes(lead.id.toString()) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                <td className="px-8 py-6">
                   {canManage && (
                     <input 
                       type="checkbox" 
                       checked={selectedIds.includes(lead.id.toString())}
                       onChange={() => toggleSelect(lead.id)}
                       className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                     />
                   )}
                </td>
                <td className="px-8 py-6 font-bold text-neutral-900 dark:text-neutral-100">
                  <Highlight text={lead.name} query={searchQuery} />
                </td>
                <td className="px-8 py-6">
                   <p className="text-xs font-bold text-blue-600">
                     <Highlight text={lead.email} query={searchQuery} />
                   </p>
                   <p className="text-[10px] text-neutral-400">
                     <Highlight text={lead.phone} query={searchQuery} />
                   </p>
                </td>
                <td className="px-8 py-6 text-sm text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                  <Highlight text={lead.message} query={searchQuery} />
                </td>
                <td className="px-8 py-6 text-[10px] font-mono text-neutral-400">{new Date(lead.created_at).toLocaleDateString()}</td>
                <td className="px-8 py-6 text-right">
                  {canManage && (
                    <button onClick={() => handleDelete('leads', lead.id)} className="text-neutral-300 hover:text-red-600 p-2 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={10} className="p-20 text-center border-none">
                  <Search className="w-8 h-8 mx-auto text-neutral-200 mb-2" />
                  <p className="text-neutral-400 font-bold">{searchQuery ? `${t.backend.common.noMatch} "${searchQuery}"` : t.backend.common.noData}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-4 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.common.show} {t.backend.common.perPage}</span>
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            {[5, 10, 20].map(size => (
              <button
                key={size}
                onClick={() => { setItemsPerPage(size); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${itemsPerPage === size ? 'bg-white dark:bg-neutral-700 text-blue-600 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
            {totalItems > 0 ? (
              <>{t.backend.common.showing} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} {t.backend.common.of} {totalItems}</>
            ) : (
              <>{t.backend.common.noData}</>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-neutral-400 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i-1] !== p - 1 && <span className="text-neutral-300">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-neutral-400 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

