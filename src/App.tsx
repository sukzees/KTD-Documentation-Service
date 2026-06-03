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


export function FAQSection() {
  const context = useContext(LanguageContext);
  const t = context?.t.faq || TRANSLATIONS.lao.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [dbFaqs, setDbFaqs] = useState<any[]>([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase.from('faqs').select('*').order('id', { ascending: true });
      if (data && data.length > 0) setDbFaqs(data);
    };
    fetchFaqs();

    const subscription = supabase
      .channel('faqs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, fetchFaqs)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const items = dbFaqs.length > 0 ? dbFaqs : t.items;

  return (
    <section id="faq" className="py-24 bg-neutral-50 dark:bg-neutral-900/50 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <HelpCircle className="w-4 h-4" />
            {t.title}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-white mb-6 font-display">{t.title}</h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={false}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm transition-colors"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <span className="font-bold text-lg text-neutral-800 dark:text-neutral-100">{item.q}</span>
                <ChevronDown className={`w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-0 text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 mt-2 transition-colors">
                       {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}