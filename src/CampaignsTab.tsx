import React, { useState, useContext } from 'react';
import { Trash2, Pencil, Upload, Sparkles, Search, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { Highlight } from '../../frontend/components';
import { LanguageContext } from "../../contexts/AppContext";
import { TRANSLATIONS } from "../../translations";

interface ClientsTabProps {
  clients: any[];
  searchQuery: string;
  isAdding: boolean;
  editingId: string | null;
  clientForm: { name: string, icon_name: string, logo_url: string };
  setClientForm: React.Dispatch<React.SetStateAction<{ name: string, icon_name: string, logo_url: string }>>;
  logoFile: File | null;
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  onAddClient: (e: React.FormEvent) => void;
  onEditClient: (client: any) => void;
  onDeleteClient: (table: string, id: string) => void;
  canManage: boolean;
  saving: boolean;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
}

export function ClientsTab({ 
  clients, searchQuery, isAdding, editingId, clientForm, setClientForm, 
  logoFile, setLogoFile, onAddClient, onEditClient, onDeleteClient, 
  canManage, saving, selectedIds, toggleSelect, toggleSelectAll 
}: ClientsTabProps) {
  const context = useContext(LanguageContext);
  const t = context?.t || TRANSLATIONS.en;
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredClients = clients.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 bg-neutral-50 dark:bg-neutral-800/30 border-b border-neutral-100 dark:border-neutral-800">
              <form onSubmit={onAddClient} className="max-w-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{t.backend.fields.name}</label>
                    <input 
                      type="text"
                      value={clientForm.name}
                      onChange={e => setClientForm({...clientForm, name: e.target.value})}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      placeholder="Enter client name..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Logo Upload</label>
                    <div className="relative">
                      <input 
                        type="file"
                        onChange={e => setLogoFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="logo-upload"
                        accept="image/*"
                      />
                      <label 
                        htmlFor="logo-upload"
                        className="w-full bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold flex items-center gap-3 cursor-pointer hover:border-blue-500 transition-all group"
                      >
                        <Upload className="w-5 h-5 text-neutral-400 group-hover:text-blue-500" />
                        <span className="text-neutral-500 truncate">{logoFile ? logoFile.name : (editingId ? 'Change Logo' : 'Upload Logo')}</span>
                      </label>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                >
                  {saving ? <span className="animate-spin text-lg">◌</span> : <Sparkles className="w-4 h-4" />}
                  {editingId ? `${t.backend.common.update} Client` : `${t.backend.common.add} Client`}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-50/50 dark:bg-neutral-900/50">
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <th className="px-8 py-4 w-10">
                {canManage && (
                  <input 
                    type="checkbox" 
                    checked={filteredClients.length > 0 && selectedIds.length === filteredClients.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                )}
              </th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Logo</th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.name}</th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">{t.backend.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {paginatedClients.map(client => (
              <tr key={client.id} className={`group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors ${selectedIds.includes(client.id.toString()) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                <td className="px-8 py-6">
                  {canManage && (
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(client.id.toString())}
                      onChange={() => toggleSelect(client.id)}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  )}
                </td>
                <td className="px-8 py-6">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    {client.logo_url ? (
                      <img src={client.logo_url} alt={client.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <Building2 className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                    <Highlight text={client.name} query={searchQuery} />
                  </p>
                </td>
                <td className="px-8 py-6 text-right">
                  {canManage && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEditClient(client)} className="text-neutral-400 hover:text-blue-600 p-2 transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteClient('clients', client.id)} className="text-neutral-400 hover:text-red-600 p-2 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
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

