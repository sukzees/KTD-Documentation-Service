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


export function TestimonialsSection() {
  const context = useContext(LanguageContext);
  const t = context?.t.testimonials || TRANSLATIONS.lao.testimonials;
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase.from('testimonials').select('*').order('id', { ascending: true });
      if (data && data.length > 0) setDbTestimonials(data);
    };
    fetchTestimonials();

    const subscription = supabase
      .channel('testimonials-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, fetchTestimonials)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const items = dbTestimonials.length > 0 ? dbTestimonials : t.items;

  return (
    <section id="testimonials" className="py-24 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <UserCheck className="w-4 h-4" />
            {t.title}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6 font-display">{t.title}</h2>
          <p className="text-neutral-500 max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item: any, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-neutral-50 p-8 rounded-[2.5rem] border border-neutral-100 relative group hover:shadow-xl hover:shadow-blue-900/5 transition-all"
            >
              <div className="absolute top-8 right-8 text-blue-100 group-hover:text-blue-200 transition-colors">
                <Quote className="w-12 h-12 rotate-180" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl uppercase shadow-lg shadow-blue-200 overflow-hidden">
                  {item.photo_url ? (
                    <img src={item.photo_url} className="w-full h-full object-cover" alt={item.name} />
                  ) : (
                    item.name.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">{item.name}</h4>
                  <p className="text-sm text-neutral-500">{item.role}</p>
                </div>
              </div>
              <p className="text-neutral-600 leading-relaxed italic">
                "{item.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}