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


export function LanguageSwitcher() {
  const context = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  if (!context) return null;
  const { lang, setLang } = context;

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: 'lao', label: 'ລາວ', flag: 'https://flagcdn.com/w40/la.png' },
    { id: 'thai', label: 'ไทย', flag: 'https://flagcdn.com/w40/th.png' },
    { id: 'en', label: 'ENG', flag: 'https://flagcdn.com/w40/gb.png' },
  ];

  const currentLang = languages.find(l => l.id === lang) || languages[0];

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 px-5 py-3 rounded-2xl border border-neutral-200 transition-all text-sm font-bold text-neutral-700 active:scale-95 shadow-sm"
      >
        <img src={currentLang.flag} alt={currentLang.label} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
        <span className="tracking-wide uppercase">{currentLang.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-neutral-400`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 bg-black/5 backdrop-blur-[2px] md:bg-transparent" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute top-full right-0 mt-3 w-40 bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl shadow-blue-900/10 dark:shadow-black/40 border border-neutral-100 dark:border-neutral-800 overflow-hidden z-20 p-2 transition-colors"
            >
              {languages.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLang(l.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${lang === l.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 active:bg-neutral-100 dark:active:bg-neutral-700'}`}
                >
                  <img src={l.flag} alt={l.label} className="w-5 h-3.5 object-cover rounded-sm" />
                  <span className="tracking-wide uppercase">{l.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}