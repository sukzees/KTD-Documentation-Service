import React, { useState, useContext } from 'react';
import { Trash2, Pencil, Upload, Sparkles, Search, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { Highlight } from '../../frontend/components';
import { LanguageContext } from "../../contexts/AppContext";
import { TRANSLATIONS } from "../../translations";

interface TestimonialsTabProps {
  testimonials: any[];
  searchQuery: string;
  isAdding: boolean;
  editingId: string | null;
  testimonialForm: { name: string, role: string, text: string, photo_url: string };
  setTestimonialForm: React.Dispatch<React.SetStateAction<{ name: string, role: string, text: string, photo_url: string }>>;
  testimonialFile: File | null;
  setTestimonialFile: React.Dispatch<React.SetStateAction<File | null>>;
  onAddTestimonial: (e: React.FormEvent) => void;
  onEditTestimonial: (testimonial: any) => void;
  onDeleteTestimonial: (table: string, id: string) => void;
  canManage: boolean;
  saving: boolean;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
}

export function TestimonialsTab({ 
  testimonials, searchQuery, isAdding, editingId, testimonialForm, setTestimonialForm, 
  testimonialFile, setTestimonialFile, onAddTestimonial, onEditTestimonial, onDeleteTestimonial, 
  canManage, saving, selectedIds, toggleSelect, toggleSelectAll 
}: TestimonialsTabProps) {
  const context = useContext(LanguageContext);
  const t = context?.t || TRANSLATIONS.en;
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTestimonials = testimonials.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredTestimonials.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTestimonials = filteredTestimonials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <div className="p-8 bg-neutral-50 dark:bg-neutral-800/30 border-b border-neutral-100 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100">
              <form onSubmit={onAddTestimonial} className="max-w-4xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{t.backend.fields.customer} {t.backend.fields.name}</label>
                    <input 
                      type="text"
                      value={testimonialForm.name}
                      onChange={e => setTestimonialForm({...testimonialForm, name: e.target.value})}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      placeholder="Reviewer name..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{t.backend.fields.role} / {t.backend.fields.company}</label>
                    <input 
                      type="text"
                      value={testimonialForm.role}
                      onChange={e => setTestimonialForm({...testimonialForm, role: e.target.value})}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      placeholder="Role (e.g. CEO, Google)..."
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{t.backend.fields.text} Content</label>
                  <textarea 
                    value={testimonialForm.text}
                    onChange={e => setTestimonialForm({...testimonialForm, text: e.target.value})}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[120px]"
                    placeholder="Enter the review content..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Photo Upload</label>
                  <div className="relative">
                    <input 
                      type="file"
                      onChange={e => setTestimonialFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="testimonial-upload"
                      accept="image/*"
                    />
                    <label 
                      htmlFor="testimonial-upload"
                      className="w-full bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold flex items-center gap-3 cursor-pointer hover:border-blue-500 transition-all group"
                    >
                      <Upload className="w-5 h-5 text-neutral-400 group-hover:text-blue-500" />
                      <span className="text-neutral-500 truncate">{testimonialFile ? testimonialFile.name : (editingId ? 'Change Photo' : 'Upload Photo')}</span>
                    </label>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                >
                  {saving ? <span className="animate-spin text-lg">◌</span> : <Sparkles className="w-4 h-4" />}
                  {editingId ? `${t.backend.common.update} Testimony` : `${t.backend.common.publish} Testimony`}
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
                    checked={filteredTestimonials.length > 0 && selectedIds.length === filteredTestimonials.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                )}
              </th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.client}</th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.text}</th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">{t.backend.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {paginatedTestimonials.map(t => (
              <tr key={t.id} className={`group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors ${selectedIds.includes(t.id.toString()) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                <td className="px-8 py-6">
                  {canManage && (
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(t.id.toString())}
                      onChange={() => toggleSelect(t.id)}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  )}
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex overflow-hidden border border-neutral-200 dark:border-neutral-700">
                      {t.photo_url ? (
                        <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <Quote className="w-4 h-4 m-auto text-neutral-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                        <Highlight text={t.name} query={searchQuery} />
                      </p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-tight">
                        <Highlight text={t.role} query={searchQuery} />
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md line-clamp-2 italic leading-relaxed">
                    "<Highlight text={t.text} query={searchQuery} />"
                  </p>
                </td>
                <td className="px-8 py-6 text-right">
                  {canManage && (
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEditTestimonial(t)} className="text-neutral-400 hover:text-blue-600 p-2 transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteTestimonial('testimonials', t.id)} className="text-neutral-400 hover:text-red-600 p-2 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredTestimonials.length === 0 && (
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

