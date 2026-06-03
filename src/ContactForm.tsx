import React, { useState, useContext } from 'react';
import { Trash2, Pencil, Sparkles, Search, Megaphone, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { Highlight } from '../../frontend/components';
import { LanguageContext } from "../../contexts/AppContext";
import { TRANSLATIONS } from "../../translations";
import { supabase } from '../../supabase';

interface CampaignsTabProps {
  campaigns: any[];
  searchQuery: string;
  isAdding: boolean;
  setIsAdding: (val: boolean) => void;
  editingId: string | null;
  setEditingId: (val: string | null) => void;
  campaignForm: any;
  setCampaignForm: React.Dispatch<React.SetStateAction<any>>;
  onSaveCampaign: (e: React.FormEvent) => void;
  onEditCampaign: (campaign: any) => void;
  onDeleteCampaign: (table: string, id: string) => void;
  onToggleActive: (id: string, currentStatus: boolean, lang: string) => void;
  canManage: boolean;
  saving: boolean;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
}

export function CampaignsTab({
  campaigns, searchQuery, isAdding, setIsAdding, editingId, setEditingId, campaignForm, setCampaignForm,
  onSaveCampaign, onEditCampaign, onDeleteCampaign, onToggleActive, canManage, saving,
  selectedIds, toggleSelect, toggleSelectAll
}: CampaignsTabProps) {
  const context = useContext(LanguageContext);
  const t = context?.t || TRANSLATIONS.en;
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCampaigns = campaigns.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.hero_title1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.hero_title2?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.footer_quote?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredCampaigns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCampaigns = filteredCampaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetForm = () => {
    setCampaignForm({
      name: '',
      is_active: false,
      lang: 'all',
      hero_promo: '',
      hero_title1: '',
      hero_title2: '',
      hero_subtitle: '',
      hero_cta_call: '',
      hero_cta_services: '',
      hero_trust_title: '',
      hero_trust_subtitle: '',
      footer_quote: '',
      footer_discount: ''
    });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            Campaign Manager
          </h3>
          <p className="text-xs text-neutral-500 mt-1">Control and override front-end Hero Section and Footer banners dynamically</p>
        </div>
        {canManage && !isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10"
          >
            <Sparkles className="w-4 h-4" />
            Create Campaign
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-sm"
          >
            <div className="p-8 text-neutral-800 dark:text-neutral-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-neutral-400">
                  {editingId ? "Edit Campaign Overrides" : "Create New Campaign Overrides"}
                </h4>
                <button 
                  onClick={resetForm}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500"
                >
                  Close
                </button>
              </div>

              <form onSubmit={onSaveCampaign} className="space-y-8">
                {/* Section 1: Campaign Configuration */}
                <div className="space-y-4">
                  <h5 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    1. General Settings
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Campaign Name</label>
                      <input 
                        type="text"
                        value={campaignForm.name}
                        onChange={e => setCampaignForm({...campaignForm, name: e.target.value})}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        placeholder="e.g. Summer promotion 10%"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Target Language</label>
                      <select
                        value={campaignForm.lang}
                        onChange={e => setCampaignForm({...campaignForm, lang: e.target.value})}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      >
                        <option value="all">All Languages</option>
                        <option value="lao">Lao ONLY (ພາສາລາວ)</option>
                        <option value="thai">Thai ONLY (ภาษาไทย)</option>
                        <option value="en">English ONLY (English)</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-6 pl-2">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={campaignForm.is_active}
                          onChange={e => setCampaignForm({...campaignForm, is_active: e.target.checked})}
                          className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Set as Active Campaign (Overrides Live Data)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 2: Hero Section Overrides */}
                <div className="space-y-4">
                  <h5 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    2. Front-End Hero Section Overrides
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Promo Badge</label>
                      <input 
                        type="text"
                        value={campaignForm.hero_promo}
                        onChange={e => setCampaignForm({...campaignForm, hero_promo: e.target.value})}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        placeholder="e.g. ໂປຣໂມຊັ່ນຫຼຸດ 10% ທຸກລາຍການ!"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Title Line 1</label>
                      <input 
                        type="text"
                        value={campaignForm.hero_title1}
                        onChange={e => setCampaignForm({...campaignForm, hero_title1: e.target.value})}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        placeholder="e.g. ເລື່ອງເອກະສານ"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Title Line 2 (Highlighted)</label>
                      <input 
                        type="text"
                        value={campaignForm.hero_title2}
                        onChange={e => setCampaignForm({...campaignForm, hero_title2: e.target.value})}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        placeholder="e.g. ໄວ້ໃຈ KTD"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Phone Call CTA Text</label>
                      <input 
                        type="text"
                        value={campaignForm.hero_cta_call}
                        onChange={e => setCampaignForm({...campaignForm, hero_cta_call: e.target.value})}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        placeholder="e.g. ໃຊ້ບໍລິການໂທເລີຍ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Hero Subtitle</label>
                      <textarea 
                        value={campaignForm.hero_subtitle}
                        onChange={e => setCampaignForm({...campaignForm, hero_subtitle: e.target.value})}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[80px]"
                        placeholder="Enter the hero description overrule here..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Trust Card Title</label>
                        <input 
                          type="text"
                          value={campaignForm.hero_trust_title}
                          onChange={e => setCampaignForm({...campaignForm, hero_trust_title: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          placeholder="e.g. 100% ສຳເລັດ"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Trust Card Subtitle</label>
                        <input 
                          type="text"
                          value={campaignForm.hero_trust_subtitle}
                          onChange={e => setCampaignForm({...campaignForm, hero_trust_subtitle: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          placeholder="e.g. ໝັ້ນໃຈໄດ້ທຸກຂັ້ນຕອນ"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Footer Overrides */}
                <div className="space-y-4">
                  <h5 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    3. Front-End Footer Campaign Overrides
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Footer Campaign Quote / Content</label>
                      <textarea 
                        value={campaignForm.footer_quote}
                        onChange={e => setCampaignForm({...campaignForm, footer_quote: e.target.value})}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[80px]"
                        placeholder="e.g. ບໍລິການແລ່ນເອກະສານແບບມືອາຊີບ ໂດຍທີມງານ KTD ປອດໄພ 100% ພ້ອມໂປຣໂມຊັ່ນສຸດພິເສດ!"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Footer Special discount text / badge</label>
                      <input 
                        type="text"
                        value={campaignForm.footer_discount}
                        onChange={e => setCampaignForm({...campaignForm, footer_discount: e.target.value})}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        placeholder="e.g. ໂປຣໂມຊັ່ນຫຼຸດ 10% ທຸກລາຍການ!"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3.5 rounded-2xl text-xs font-bold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                  >
                    {saving ? <span className="animate-spin text-lg">◌</span> : <Sparkles className="w-4 h-4" />}
                    {editingId ? "Update Campaign" : "Publish Campaign"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50/55 dark:bg-neutral-900/55">
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <th className="px-8 py-4 w-10">
                  {canManage && (
                    <input 
                      type="checkbox" 
                      checked={filteredCampaigns.length > 0 && selectedIds.length === filteredCampaigns.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  )}
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest font-display">Campaign Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest font-display">Language Target</th>
                <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest font-display">Status (Toggle Active)</th>
                <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest font-display">Preview Details (Hero & Footer)</th>
                <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest font-display text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {paginatedCampaigns.map(campaign => (
                <tr key={campaign.id} className={`group hover:bg-neutral-50/20 dark:hover:bg-neutral-800/10 transition-colors ${selectedIds.includes(campaign.id.toString()) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-8 py-6">
                    {canManage && (
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(campaign.id.toString())}
                        onChange={() => toggleSelect(campaign.id)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                      <Highlight text={campaign.name} query={searchQuery} />
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-block px-2 py-1 text-[10px] font-black uppercase rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {campaign.lang === 'all' ? 'All Languages' : campaign.lang}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => canManage && onToggleActive(campaign.id, campaign.is_active, campaign.lang)}
                      disabled={saving}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm transition-all ${
                        campaign.is_active 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:opacity-85' 
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200'
                      }`}
                    >
                      {campaign.is_active ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1 max-w-[320px]">
                      {campaign.hero_title1 && (
                        <div className="text-xs text-neutral-500 line-clamp-1">
                          <strong className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-600 mr-1">Hero:</strong>
                          "{campaign.hero_title1} {campaign.hero_title2}"
                        </div>
                      )}
                      {campaign.footer_quote && (
                        <div className="text-xs text-neutral-400 line-clamp-1 italic">
                          <strong className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-600 mr-1">Footer:</strong>
                          "{campaign.footer_quote}"
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {canManage && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEditCampaign(campaign)} className="text-neutral-400 hover:text-blue-600 p-2 transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDeleteCampaign('campaigns', campaign.id)} className="text-neutral-400 hover:text-red-600 p-2 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center border-none">
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
    </div>
  );
}
