import React, { useState } from 'react';
import { Trash2, Upload, Sparkles, Search, FileText, Download, Clock, CheckCircle2, Tags, Folder, Pencil, Eye, ChevronLeft, ChevronRight, Pause, XCircle, RefreshCw, Archive, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { Highlight } from '../../frontend/components';

interface DocumentsTabProps {
  documents: any[];
  searchQuery: string;
  isAdding: boolean;
  editingId: string | null;
  documentForm: { title: string, category: string, file_url: string, status: string, customer_id: string };
  setDocumentForm: React.Dispatch<React.SetStateAction<{ title: string, category: string, file_url: string, status: string, customer_id: string }>>;
  documentFile: File | null;
  setDocumentFile: React.Dispatch<React.SetStateAction<File | null>>;
  docCategories: any[];
  customers: any[];
  onAddDocument: (e: React.FormEvent) => void;
  onEditDocument: (doc: any) => void;
  onDeleteDocument: (table: string, id: string) => void;
  canManage: boolean;
  saving: boolean;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  // Category props
  categoryForm: { name: string, description: string };
  setCategoryForm: React.Dispatch<React.SetStateAction<{ name: string, description: string }>>;
  onAddCategory: (e: React.FormEvent) => void;
  onEditCategory: (category: any) => void;
  onDeleteCategory: (table: string, id: string) => void;
}

export function DocumentsTab({ 
  documents, searchQuery, isAdding, editingId, documentForm, setDocumentForm, 
  documentFile, setDocumentFile, docCategories, onAddDocument, onEditDocument, onDeleteDocument, 
  canManage, saving, selectedIds, toggleSelect, toggleSelectAll,
  categoryForm, setCategoryForm, onAddCategory, onEditCategory, onDeleteCategory,
  customers
}: DocumentsTabProps) {
  const [subTab, setSubTab] = useState<'docs' | 'cats'>('docs');
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const filteredDocuments = documents.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    const docDate = new Date(item.created_at).getTime();
    const start = startDate ? new Date(startDate).getTime() : -Infinity;
    const end = endDate ? new Date(endDate).getTime() : Infinity;
    const matchesDate = docDate >= start && docDate <= (endDate ? end + 86400000 : Infinity); // +1 day for inclusive end date

    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredCategories = docCategories.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPagesDocs = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocs = filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPagesCats = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCats = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalItems = subTab === 'docs' ? filteredDocuments.length : filteredCategories.length;
  const totalPages = subTab === 'docs' ? totalPagesDocs : totalPagesCats;

  return (
    <div className="space-y-0">
      <div className="px-8 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-6">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => { setSubTab('docs'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${subTab === 'docs' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            <Folder className="w-4 h-4" />
            LIBRARY
          </button>
          <button 
            onClick={() => { setSubTab('cats'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${subTab === 'cats' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            <Tags className="w-4 h-4" />
            CATEGORIES
          </button>
        </div>

        {subTab === 'docs' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</span>
              <select 
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-neutral-50 dark:bg-neutral-800 border-none rounded-lg px-3 py-1.5 text-[10px] font-bold focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="inprogress">In-Progress</option>
                <option value="hold">Hold</option>
                <option value="cancel">Cancel</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-2 border-l border-neutral-100 dark:border-neutral-800 pl-4">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Date Range</span>
              <div className="flex items-center gap-1">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="bg-neutral-50 dark:bg-neutral-800 border-none rounded-lg px-2 py-1 text-[10px] font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <span className="text-neutral-300">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="bg-neutral-50 dark:bg-neutral-800 border-none rounded-lg px-2 py-1 text-[10px] font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-0">
        {subTab === 'docs' ? (
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
                    <form onSubmit={onAddDocument} className="max-w-4xl space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Document Title</label>
                          <input 
                            type="text"
                            value={documentForm.title}
                            onChange={e => setDocumentForm({...documentForm, title: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="Title of the document..."
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Category</label>
                          <select 
                            value={documentForm.category}
                            onChange={e => setDocumentForm({...documentForm, category: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          >
                            {docCategories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Assigned Customer</label>
                          <select 
                            value={documentForm.customer_id}
                            onChange={e => setDocumentForm({...documentForm, customer_id: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          >
                            <option value="">Unassigned (Internal)</option>
                            {customers.map(c => (
                              <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Status</label>
                          <select 
                            value={documentForm.status}
                            onChange={e => setDocumentForm({...documentForm, status: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          >
                            <option value="draft">Draft</option>
                            <option value="inprogress">In-Progress</option>
                            <option value="hold">Hold</option>
                            <option value="cancel">Cancel</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">File Attachment</label>
                        <div className="relative">
                          <input 
                            type="file"
                            onChange={e => setDocumentFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="document-upload"
                          />
                          <label 
                            htmlFor="document-upload"
                            className="w-full bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold flex items-center gap-3 cursor-pointer hover:border-blue-500 transition-all group"
                          >
                            <Upload className="w-5 h-5 text-neutral-400 group-hover:text-blue-500" />
                            <span className="text-neutral-500 truncate">{documentFile ? documentFile.name : 'Select PDF or common document file'}</span>
                          </label>
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                      >
                        {saving ? <span className="animate-spin text-lg">◌</span> : <Sparkles className="w-4 h-4" />}
                        {editingId ? 'Update Document' : 'Archive Document'}
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
                          checked={filteredDocuments.length > 0 && selectedIds.length === filteredDocuments.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      )}
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Document</th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Assigned To</th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Classification</th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedDocs.map(doc => (
                    <tr key={doc.id} className={`group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors ${selectedIds.includes(doc.id.toString()) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                      <td className="px-8 py-6">
                        {canManage && (
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(doc.id.toString())}
                            onChange={() => toggleSelect(doc.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 border border-neutral-200 dark:border-neutral-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-all">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                              <Highlight text={doc.title} query={searchQuery} />
                            </p>
                            <p className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                              {new Date(doc.created_at).toLocaleDateString()} • {((doc.file_url || "").split('.').pop() || 'PDF').toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium">
                        {doc.customer_id ? (
                          <div className="flex items-center gap-2">
                             <span className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                               <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                             </span>
                             <span className="text-neutral-900 dark:text-neutral-100 font-bold">
                               {customers.find(c => c.id === doc.customer_id)?.name || 'Unknown'}
                             </span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider">Internal</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                         <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                          <Highlight text={doc.category} query={searchQuery} />
                         </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`flex items-center gap-1.5 ${
                          doc.status === 'completed' ? 'text-green-600' : 
                          doc.status === 'archived' ? 'text-green-800 dark:text-green-600' : 
                          doc.status === 'inprogress' ? 'text-blue-600 dark:text-blue-400' :
                          doc.status === 'hold' ? 'text-orange-500' :
                          doc.status === 'cancel' ? 'text-red-600' :
                          doc.status === 'draft' ? 'text-neutral-900 dark:text-neutral-50' :
                          'text-neutral-500'
                        }`}>
                          {doc.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {doc.status === 'draft' && <Clock className="w-3 h-3" />}
                          {doc.status === 'archived' && <Archive className="w-3 h-3" />}
                          {doc.status === 'inprogress' && <RefreshCw className="w-3 h-3 animate-spin" />}
                          {doc.status === 'hold' && <Pause className="w-3 h-3" />}
                          {doc.status === 'cancel' && <XCircle className="w-3 h-3" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">
                             <Highlight text={doc.status === 'inprogress' ? 'In Progress' : doc.status} query={searchQuery} />
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all flex items-center gap-2 text-xs font-bold"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden xl:inline">VIEW</span>
                          </a>
                          <button 
                            onClick={() => handleDownload(doc.file_url, `${doc.title}.${(doc.file_url || "").split('.').pop() || 'pdf'}`)}
                            className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all flex items-center gap-2 text-xs font-bold"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden xl:inline">DOWNLOAD</span>
                          </button>
                          {canManage && (
                            <>
                              <button 
                                onClick={() => onEditDocument(doc)} 
                                className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => onDeleteDocument('documents', doc.id)} 
                                className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDocuments.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-20 text-center border-none">
                        <Search className="w-8 h-8 mx-auto text-neutral-200 mb-2" />
                        <p className="text-neutral-400 font-bold">{searchQuery ? `No matches found for "${searchQuery}"` : 'No data available yet'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
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
                    <form onSubmit={onAddCategory} className="max-w-4xl space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Category Name</label>
                          <input 
                            type="text"
                            value={categoryForm.name}
                            onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="Category name..."
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Description</label>
                          <input 
                            type="text"
                            value={categoryForm.description}
                            onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="Brief description..."
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                      >
                        {saving ? <span className="animate-spin text-lg">◌</span> : <Tags className="w-4 h-4" />}
                        {editingId ? 'Update Category' : 'Create Category'}
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
                          checked={filteredCategories.length > 0 && selectedIds.length === filteredCategories.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      )}
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Description</th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedCats.map(cat => (
                    <tr key={cat.id} className={`group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors ${selectedIds.includes(cat.id.toString()) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                      <td className="px-8 py-6">
                        {canManage && (
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(cat.id.toString())}
                            onChange={() => toggleSelect(cat.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                            <Tags className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm uppercase">
                              <Highlight text={cat.name} query={searchQuery} />
                            </p>
                            <p className="text-[10px] text-neutral-400 font-mono">ID: {cat.id.toString().slice(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">
                          <Highlight text={cat.description} query={searchQuery} />
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canManage && (
                            <>
                              <button onClick={() => onEditCategory(cat)} className="text-neutral-400 hover:text-blue-600 p-2 transition-all">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => onDeleteCategory('document_categories', cat.id)} className="text-neutral-400 hover:text-red-600 p-2 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <div className="px-8 py-4 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Show per page</span>
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
              <>Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}</>
            ) : (
              <>No items to display</>
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
