import React, { useState, useEffect, createContext, useContext, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Icons from "lucide-react";
import { 
  FileCheck, Globe, MapPin, Phone, Clock, CheckCircle2, BadgePercent, Play,
  ArrowRight, Menu, X, Building2, Stamp, UserCheck, Video, Loader2, RefreshCw,
  Sparkles, Key, ChevronDown, HelpCircle, Quote, Facebook, Instagram, Linkedin,
  Building, Shield, Zap, LayoutDashboard, LogOut, Mail, User, Users, ExternalLink,
  Trash2, Pencil, Upload, Search, Sun, Moon, FileText, Eye, Download
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { TRANSLATIONS, type Language } from "../../translations";
import { supabase } from "../../supabase";
import { MODULES, ACTIONS, ALL_PERMISSIONS } from "../../constants";
import { LanguageContext, ThemeContext } from "../../contexts/AppContext";


export function ContactForm() {
  const context = useContext(LanguageContext);
  const t = (context?.t as any).contactForm || TRANSLATIONS.lao.contactForm;
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    try {
      const leadData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message,
      };
      
      const { error } = await supabase.from('leads').insert([leadData]);
      
      if (error) throw error;

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error("Error submitting form:", err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-blue-900/10 dark:shadow-blue-950/20 border border-neutral-100 dark:border-neutral-800 max-w-lg mx-auto transition-colors">
      <h3 className="text-2xl text-center font-black text-blue-900 dark:text-blue-400 mb-6 font-display">{t.title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1 transition-colors">{t.fullName}</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-400" 
              placeholder={t.fullNamePlaceholder}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1 transition-colors">{t.phone}</label>
            <input 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-400" 
              placeholder={t.phonePlaceholder}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1 transition-colors">{t.email}</label>
          <input 
            type="email" 
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-400" 
            placeholder={t.emailPlaceholder}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1 transition-colors">{t.message}</label>
          <textarea 
            rows={4}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-400" 
            placeholder={t.messagePlaceholder}
          />
        </div>
        <button 
          disabled={status === 'submitting'}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${status === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>{t.submitting}</span>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 className="w-6 h-6" />
              <span>{t.successBtn}</span>
            </>
          ) : (
            t.submit
          )}
        </button>
        {status === 'error' && <p className="text-red-500 text-xs text-center font-bold">{t.error}</p>}
        {status === 'success' && <p className="text-green-600 text-xs text-center font-bold">{t.success}</p>}
      </form>
    </div>
  );
}