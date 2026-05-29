import { LucideIcon } from './LucideIcon';
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


export function ClientsSection() {
  const context = useContext(LanguageContext);
  const t = context?.t.clients || TRANSLATIONS.lao.clients;
  const [dbClients, setDbClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from('clients').select('*').order('id', { ascending: true });
      if (data && data.length > 0) setDbClients(data);
    };
    fetchClients();

    const subscription = supabase
      .channel('clients-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchClients)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const staticClients = [
    { name: "SME Group", icon: "Building2" },
    { name: "Global Trading", icon: "Globe" },
    { name: "Legal Pro", icon: "FileCheck" },
    { name: "Venture Corp", icon: "Building" },
    { name: "Tech Solutions", icon: "Shield" },
    { name: "Logistic Hub", icon: "Zap" },
  ];

  const clientLogos = dbClients.length > 0 
    ? dbClients.map(c => ({ 
        name: c.name, 
        icon: c.icon_name || "Building2", 
        logo_url: c.logo_url 
      }))
    : staticClients;

  return (
    <section id="clients" className="py-20 bg-white dark:bg-neutral-950 overflow-hidden border-b border-neutral-100 dark:border-neutral-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-white mb-2 font-display">{t.title}</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm whitespace-pre-wrap">{t.subtitle}</p>
      </div>
      
      <div className="flex overflow-hidden group">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...clientLogos, ...clientLogos].map((client, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-4 px-12 py-4 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100"
            >
              <div className="bg-neutral-100 dark:bg-neutral-800 w-16 h-16 p-3 rounded-2xl text-neutral-600 dark:text-neutral-400 flex items-center justify-center overflow-hidden transition-colors">
                {client.logo_url ? (
                  <img src={client.logo_url} className="w-full h-full object-contain" alt={client.name} />
                ) : (
                  <LucideIcon name={client.icon} className="w-10 h-10" />
                )}
              </div>
              <span className="text-xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">{client.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  );
}