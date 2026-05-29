import React, { useState, useContext } from "react";
import { 
  Trophy, TrendingUp, DollarSign, Calendar, Target, 
  MoreVertical, Edit2, Trash2, Search, Plus, 
  CheckCircle2, XCircle, Clock, AlertCircle, ChevronRight,
  Building2, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LanguageContext } from "../../contexts/AppContext";
import { TRANSLATIONS } from "../../translations";

interface Deal {
  id: string;
  title: string;
  value: number;
  customer_id: string;
  stage: 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  expected_close_date: string | null;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  company: string | null;
}

interface PipelineTabProps {
  deals: Deal[];
  customers: Customer[];
  searchQuery: string;
  isAdding: boolean;
  editingId: string | null;
  dealForm: { title: string, value: number, customer_id: string, stage: string, expected_close_date: string };
  setDealForm: React.Dispatch<React.SetStateAction<{ title: string, value: number, customer_id: string, stage: string, expected_close_date: string }>>;
  onAddDeal: (e: React.FormEvent) => void;
  onEditDeal: (deal: Deal) => void;
  onUpdateDealStage?: (dealId: string, newStage: string) => void;
  onDeleteDeal: (table: string, id: string) => void;
  canManage: boolean;
  saving: boolean;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
}

export function PipelineTab({
  deals,
  customers,
  searchQuery,
  isAdding,
  editingId,
  dealForm,
  setDealForm,
  onAddDeal,
  onEditDeal,
  onUpdateDealStage,
  onDeleteDeal,
  canManage,
  saving,
  selectedIds,
  toggleSelect,
  toggleSelectAll
}: PipelineTabProps) {
  const context = useContext(LanguageContext);
  const t = context?.t || TRANSLATIONS.en;
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("dealId", id);
    setDraggedId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    if (dealId && onUpdateDealStage) {
      onUpdateDealStage(dealId, stage);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const filtered = deals.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customers.find(c => c.id === d.customer_id)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const STAGES = ['Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  
  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'Qualified': return t.backend.fields.qualified;
      case 'Proposal': return t.backend.fields.proposal;
      case 'Negotiation': return t.backend.fields.negotiation;
      case 'Closed Won': return t.backend.fields.closedWon;
      case 'Closed Lost': return t.backend.fields.closedLost;
      default: return stage;
    }
  };

  const isOverdue = (dateString: string | null, stage: string) => {
    if (!dateString || stage === 'Closed Won' || stage === 'Closed Lost') return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString < today;
  };

  const getStatusColor = (stage: string) => {
    switch (stage) {
      case 'Qualified': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Proposal': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Negotiation': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Closed Won': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Closed Lost': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Qualified': return <Target className="w-3 h-3" />;
      case 'Proposal': return <Edit2 className="w-3 h-3" />;
      case 'Negotiation': return <Clock className="w-3 h-3" />;
      case 'Closed Won': return <Trophy className="w-3 h-3" />;
      case 'Closed Lost': return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  if (isAdding) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            {editingId ? <Edit2 className="w-6 h-6 text-white" /> : <TrendingUp className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white uppercase italic">
              {editingId ? t.backend.fields.editOpportunity : t.backend.fields.newOpportunity}
            </h3>
            <p className="text-sm md:text-base text-neutral-500 font-medium">{t.backend.fields.opportunity} {t.backend.common.notice}</p>
          </div>
        </div>

        <form onSubmit={onAddDeal} className="max-w-3xl bg-neutral-50 dark:bg-neutral-800/50 p-6 md:p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-4">{t.backend.fields.title}</label>
              <input
                required
                type="text"
                placeholder="e.g. Q3 Software Implementation"
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={dealForm.title}
                onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-4">{t.backend.fields.customer}</label>
              <select
                required
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                value={dealForm.customer_id}
                onChange={(e) => setDealForm({ ...dealForm, customer_id: e.target.value })}
              >
                <option value="">{t.backend.common.show} {t.backend.fields.customer}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-4">{t.backend.fields.value} ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  value={isNaN(dealForm.value) ? '' : dealForm.value}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    setDealForm({ ...dealForm, value: val });
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-4">{t.backend.fields.stage}</label>
              <select
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                value={dealForm.stage}
                onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}
              >
                {STAGES.map(s => <option key={s} value={s}>{getStageLabel(s)}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-4">{t.backend.fields.date}</label>
              <input
                type="date"
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={dealForm.expected_close_date}
                onChange={(e) => setDealForm({ ...dealForm, expected_close_date: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              disabled={saving}
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? <Clock className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
              {editingId ? t.backend.common.update : t.backend.fields.newOpportunity}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('board')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'board' ? 'bg-white dark:bg-neutral-900 shadow-sm text-indigo-600' : 'text-neutral-500'}`}
          >
            {t.backend.fields.kanbanBoard}
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white dark:bg-neutral-900 shadow-sm text-indigo-600' : 'text-neutral-500'}`}
          >
            {t.backend.fields.listView}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'board' ? (
          <motion.div 
            key="board"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide"
          >
            {STAGES.map(stage => {
              const stageDeals = filtered.filter(d => d.stage === stage);
              const totalValue = stageDeals.reduce((sum, d) => sum + Number(d.value), 0);
              return (
                <div 
                  key={stage} 
                  className="flex-shrink-0 w-80 flex flex-col gap-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${getStatusColor(stage).split(' ')[0]}`} />
                       <h4 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-wider">{getStageLabel(stage)}</h4>
                       <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                    </div>
                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 tracking-widest italic">${totalValue.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex flex-col gap-3 min-h-[500px] bg-neutral-50/50 dark:bg-neutral-800/10 p-3 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    {stageDeals.map(deal => (
                      <div 
                        key={deal.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-indigo-500 cursor-grab active:cursor-grabbing ${draggedId === deal.id ? 'opacity-40 scale-95' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-neutral-900 dark:text-white text-sm line-clamp-1">{deal.title}</h5>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEditDeal(deal)} className="p-1 text-neutral-400 hover:text-indigo-600 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onDeleteDeal('deals', deal.id)} className="p-1 text-neutral-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-medium mb-4">
                          <Building2 className="w-3 h-3" />
                          {customers.find(c => c.id === deal.customer_id)?.name || t.backend.fields.customer}
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-50 dark:border-neutral-800">
                           <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-900 dark:text-white">
                              <DollarSign className="w-3.5 h-3.5 text-green-500" />
                              {Number(deal.value).toLocaleString()}
                           </div>
                           {deal.expected_close_date && (
                             <div className={`flex items-center gap-1 text-[10px] font-medium italic ${isOverdue(deal.expected_close_date, deal.stage) ? 'text-red-500 font-black' : 'text-neutral-400'}`}>
                               <Calendar className="w-3 h-3" />
                               {new Date(deal.expected_close_date).toLocaleDateString()}
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="h-full flex items-center justify-center opacity-20 py-10">
                         <TrendingUp className="w-8 h-8 text-neutral-400" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <th className="px-6 py-4 text-left w-10">
                    <button onClick={toggleSelectAll} className="w-5 h-5 rounded-md border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-center transition-colors hover:border-indigo-500">
                      {selectedIds.length > 0 && selectedIds.length === filtered.length && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-sm" />}
                      {selectedIds.length > 0 && selectedIds.length < filtered.length && <div className="w-2.5 h-0.5 bg-indigo-600 rounded-sm" />}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.opportunity}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.customer}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.stage}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.date}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.value}</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                {filtered.map((deal) => (
                  <tr key={deal.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleSelect(deal.id)}
                        className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedIds.includes(deal.id) ? 'bg-indigo-600 border-indigo-600' : 'border-neutral-200 dark:border-neutral-700 group-hover:border-neutral-400'}`}
                      >
                        {selectedIds.includes(deal.id) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getStatusColor(deal.stage).split(' ')[0]}`}>
                          {getStageIcon(deal.stage)}
                        </div>
                        <span className="font-bold text-neutral-900 dark:text-white text-sm">{deal.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-neutral-500">
                        {customers.find(c => c.id === deal.customer_id)?.name || t.backend.fields.customer}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(deal.stage)}`}>
                        {getStageIcon(deal.stage)}
                        {getStageLabel(deal.stage)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-xs font-medium italic ${isOverdue(deal.expected_close_date, deal.stage) ? 'text-red-500 font-black' : 'text-neutral-400'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-bold text-sm text-neutral-900 dark:text-white">
                        <span className="text-green-500">$</span>
                        {Number(deal.value).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEditDeal(deal)} className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDeleteDeal('deals', deal.id)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
           <Search className="w-12 h-12 text-neutral-200 dark:text-neutral-800 mx-auto mb-4" />
           <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase italic tracking-widest">{t.backend.common.noMatch}</h3>
           <p className="text-neutral-500 font-medium">{t.backend.common.noData}</p>
        </div>
      )}
    </div>
  );
}
