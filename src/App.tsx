/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import * as Icons from "lucide-react";
import { 
  FileCheck, 
  Globe, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  BadgePercent, 
  Play,
  ArrowRight,
  Menu,
  X,
  Building2,
  Stamp,
  UserCheck,
  Video,
  Loader2,
  RefreshCw,
  Sparkles,
  Key,
  ChevronDown,
  HelpCircle,
  Quote,
  Facebook,
  Instagram,
  Linkedin,
  Building,
  Shield,
  Zap,
  LayoutDashboard,
  LogOut,
  Mail,
  User,
  Users,
  ExternalLink,
  Trash2,
  Pencil,
  Upload,
  Search,
  Sun,
  Moon,
  FileText,
  Eye,
  Download,
} from "lucide-react";
import React, { useState, useEffect, createContext, useContext, useMemo } from "react";
import { GoogleGenAI } from "@google/genai";
import { TRANSLATIONS, type Language } from "./translations";
import { supabase } from "./supabase";
import { MODULES, ACTIONS, ALL_PERMISSIONS } from "./constants";
import { LanguageContext, ThemeContext } from "./contexts/AppContext";
import { LanguageSwitcher, ClientsSection, TestimonialsSection, ContactForm, FAQSection, ProcessVisualizer, LucideIcon, Highlight, UserProfile } from "./frontend/components";
import { LoginPage, AdminDashboard } from "./backend/pages";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Helper for dynamic icons

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('lao');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const [activeCampaign, setActiveCampaign] = useState<any | null>(null);

  useEffect(() => {
    const fetchActiveCampaign = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('is_active', true)
          .in('lang', [lang, 'all'])
          .order('created_at', { ascending: false })
          .limit(1);
        if (error) {
          return;
        }
        if (data && data.length > 0) {
          setActiveCampaign(data[0]);
        } else {
          setActiveCampaign(null);
        }
      } catch (e) {
        // campaigns table might not exist yet
      }
    };
    fetchActiveCampaign();
  }, [lang]);

  useEffect(() => {
    const savedAdmin = localStorage.getItem("ktd_admin");
    if (savedAdmin) {
      try {
        setAdminUser(JSON.parse(savedAdmin));
      } catch (e) {
        localStorage.removeItem("ktd_admin");
      }
    }
    setAuthLoading(false);
  }, []);

  const handleAdminLogin = (user: any) => {
    setAdminUser(user);
    setIsAdminView(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("ktd_admin");
    setAdminUser(null);
    setIsAdminView(false);
  };

  const t = TRANSLATIONS[lang];

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <LanguageContext.Provider value={{ lang, setLang, t }}>
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900'}`}>
          {authLoading ? (
            <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          ) : isAdminView ? (
            !adminUser ? <LoginPage onLogin={handleAdminLogin} /> : <AdminDashboard user={adminUser} onLogout={handleLogout} />
          ) : (
            <div className="min-h-screen font-sans overflow-x-hidden">
              {/* Navbar content here... */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20 font-sans">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                <div className="relative h-12 flex items-center">
                  <img src="/logo.png" alt="KTD Logo" className="h-full w-auto object-contain dark:invert mix-blend-multiply dark:mix-blend-normal" />
                  <span className="font-bold text-xl tracking-tight text-blue-600 italic ml-2">KTD</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-sm">
                <a href="#services" className="text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider text-sm font-black">{t.nav.services}</a>
                <a href="#process" className="text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider text-sm font-black">{t.nav.campaign}</a>
                <a href="#testimonials" className="text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider text-sm font-black">{t.nav.testimonials}</a>
                <a href="#faq" className="text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider text-sm font-black">{t.nav.faq}</a>
                <a href="#contact" className="text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider text-sm font-black">{t.nav.contact}</a>
                
                <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1"></div>
                
                <LanguageSwitcher />

                <button 
                  onClick={() => setIsAdminView(true)}
                  className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-bold text-sm uppercase tracking-widest shadow-sm active:scale-95"
                >
                  {t.nav.admin}
                </button>
              </div>

              <div className="md:hidden flex items-center gap-2">
                <button 
                  className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 shadow-sm" 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="md:hidden absolute top-[64px] left-0 w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-xl p-6 space-y-4"
              >
                <div className="grid grid-cols-1 gap-2">
                  <a href="#services" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 font-bold text-neutral-600 dark:text-neutral-300 transition-colors">{t.nav.services}</a>
                  <a href="#process" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 font-bold text-neutral-600 dark:text-neutral-300 transition-colors">{t.nav.campaign}</a>
                  <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 font-bold text-neutral-600 dark:text-neutral-300 transition-colors">{t.nav.testimonials}</a>
                  <a href="#faq" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 font-bold text-neutral-600 dark:text-neutral-300 transition-colors">{t.nav.faq}</a>
                </div>
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-3">
                  <LanguageSwitcher />
                  <button 
                    onClick={() => { setIsAdminView(true); setIsMenuOpen(false); }}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold active:scale-95 transition-transform"
                  >
                    {t.nav.admin}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <section className="relative pt-40 pb-20 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-semibold mb-6">
                <BadgePercent className="w-4 h-4" />
                {activeCampaign?.hero_promo || t.hero.promo}
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight text-blue-900 dark:text-white font-display">
                {activeCampaign?.hero_title1 || t.hero.title1} <br />
                <span className="text-blue-600 dark:text-blue-400">{activeCampaign?.hero_title2 || t.hero.title2}</span>
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-lg leading-relaxed">
                {activeCampaign?.hero_subtitle || t.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="tel:56618853" 
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-blue-900/40 transition-all group"
                >
                  {activeCampaign?.hero_cta_call || t.hero.ctaCall}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a 
                  href="#services" 
                  className="inline-flex items-center justify-center bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 px-8 py-4 rounded-2xl font-bold text-lg hover:border-blue-200 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  {activeCampaign?.hero_cta_services || t.hero.ctaServices}
                </a>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-blue-600 rounded-[2.5rem] aspect-square flex items-center justify-center relative overflow-hidden group shadow-2xl shadow-blue-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)] opacity-50" />
                <FileCheck className="w-48 h-48 text-white z-10 drop-shadow-2xl" />
                
                {/* Decorative elements */}
                <div className="absolute top-10 right-10 w-24 h-24 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 group-hover:scale-125 transition-transform duration-700" />
              </div>
              
              {/* Trust Badges */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-700 flex items-center gap-4 transition-colors">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-bold text-xl text-neutral-800 dark:text-neutral-100 tracking-tight">{activeCampaign?.hero_trust_title || t.hero.trustTitle}</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{activeCampaign?.hero_trust_subtitle || t.hero.trustSubtitle}</div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Decorative Blobs */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[100px] -z-10" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-amber-100 dark:bg-amber-900/20 rounded-full blur-[100px] -z-10" />
        </section>

        <ClientsSection />

        {/* Services Grid */}
        <section id="services" className="py-24 bg-white dark:bg-neutral-900 border-y border-neutral-100 dark:border-neutral-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-blue-900 dark:text-white mb-4 font-display">{t.services.title}</h2>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto italic">
                {t.services.quote}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {t.services.items.map((service, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -10 }}
                  className="p-8 rounded-[2rem] bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 transition-all hover:shadow-2xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 group"
                >
                  <div className="mb-6 p-4 bg-white dark:bg-neutral-800 rounded-2xl inline-block shadow-sm group-hover:bg-blue-600 transition-colors">
                    <div className="group-hover:text-white transition-colors text-blue-600 dark:text-blue-400">
                      {idx === 0 ? <Building2 className="w-8 h-8" /> : idx === 1 ? <Globe className="w-8 h-8" /> : <Stamp className="w-8 h-8" />}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-100">{service.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium opacity-80">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Document Process Section */}
        <section id="process" className="py-24 px-4 overflow-hidden bg-white dark:bg-neutral-950 transition-colors">
          <div className="max-w-7xl mx-auto space-y-24">
            <ProcessVisualizer />

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* FAQ Section */}
            <FAQSection />
          </div>
        </section>

        {/* Call to Action Bar */}
        <section id="contact" className="py-24 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 border-[40px] border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 border-[30px] border-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 text-left relative z-10">
            <ContactForm />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-neutral-900 text-white border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="col-span-full lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="relative h-10 bg-white p-1 rounded overflow-hidden">
                  <img src="/logo.png" alt="KTD Logo" className="h-full w-auto object-contain mix-blend-multiply" />
                </div>
                // <span className="font-bold text-xl tracking-tight text-white italic">KTD</span>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed mb-6 italic">
                {t.footer.quote}
              </p>
              <div className="flex gap-3">
                <a 
                  href="tel:56618853"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all cursor-pointer border border-white/10 group"
                  title="Call Us"
                >
                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1877F2] transition-all cursor-pointer border border-white/10 group"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E4405F] transition-all cursor-pointer border border-white/10 group"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#0A66C2] transition-all cursor-pointer border border-white/10 group"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
            
            <div>
              <h5 className="font-bold mb-6 text-blue-400 uppercase text-xs tracking-widest font-display">{t.footer.services}</h5>
              <ul className="space-y-4 text-neutral-400 text-sm font-medium">
                <li className="hover:text-white transition-colors cursor-pointer">{t.services.items[0].title}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t.services.items[1].title}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t.services.items[2].title}</li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#testimonials">{t.nav.testimonials}</a>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#faq">{t.nav.faq}</a>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">{t.footer.contact}</li>
                <li className="pt-4 mt-4 border-t border-white/5">
                  <button 
                    onClick={() => setIsAdminView(true)}
                    className="flex items-center gap-2 text-neutral-600 hover:text-neutral-400 transition-colors uppercase text-[10px] font-black tracking-widest"
                  >
                    <Shield className="w-3 h-3" />
                    {adminUser ? "Admin Dashboard" : "Admin Login"}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-6 text-blue-400 uppercase text-xs tracking-widest font-display">{t.footer.contact}</h5>
              <ul className="space-y-4 text-neutral-400 text-sm font-medium">
                <li className="flex items-center gap-3 font-display">
                  <Phone className="w-4 h-4" />
                  56618853
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" />
                  {t.footer.location}
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-4 h-4" />
                  {t.footer.hours}
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-6 text-blue-400 uppercase text-xs tracking-widest font-display">{t.footer.latestCampaign}</h5>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                 <p className="text-xs text-neutral-400 italic mb-2 tracking-tight overflow-hidden text-ellipsis line-clamp-2">{activeCampaign?.footer_quote || t.footer.campaignQuote}</p>
                 <span className="text-[10px] font-bold text-amber-400">{activeCampaign?.footer_discount || t.footer.discount}</span>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 text-center text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} KTD Documentation Service. All rights reserved.
          </div>
        </footer>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 z-[60] bg-white p-6 flex flex-col md:hidden overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12 landscape:mb-6 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 flex items-center">
                    <img src="/logo.png" alt="KTD Logo" className="h-full w-auto object-contain mix-blend-multiply" />
                  </div>
                  <span className="font-bold text-xl text-blue-600 font-display italic">KTD</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-neutral-100 rounded-full active:scale-90 transition-transform"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-6 landscape:gap-4 text-2xl font-bold pb-8">
                <a 
                  href="#services" 
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-blue-600 transition-colors"
                >
                  {t.nav.services}
                </a>
                <a 
                  href="#process" 
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-blue-600 transition-colors"
                >
                  {t.nav.campaign}
                </a>
                <a 
                  href="#testimonials" 
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-blue-600 transition-colors"
                >
                  {t.nav.testimonials}
                </a>
                <a 
                  href="#faq" 
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-blue-600 transition-colors"
                >
                  {t.nav.faq}
                </a>
                <a 
                  href="#contact" 
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-blue-600 transition-colors"
                >
                  {t.nav.contact}
                </a>
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAdminView(true);
                  }}
                  className="flex items-center gap-2 text-neutral-400 hover:text-blue-600 transition-colors uppercase text-[10px] font-black tracking-widest mt-4 text-left"
                >
                  <Shield className="w-3 h-3" />
                  Admin Login
                </button>
                <div className="py-2 inline-block">
                  <LanguageSwitcher />
                </div>
                <a 
                  href="tel:56618853" 
                  className="bg-blue-600 text-white p-5 landscape:p-4 rounded-3xl flex items-center justify-between shadow-xl shadow-blue-100 mt-4 landscape:mt-2 active:scale-95 transition-transform"
                >
                  <span className="font-display">{t.nav.callNow}</span>
                  <Phone className="w-6 h-6" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )}
  </div>
</LanguageContext.Provider>
</ThemeContext.Provider>
);
}
