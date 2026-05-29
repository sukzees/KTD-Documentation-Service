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


export function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const context = useContext(LanguageContext);
  const t = context?.t || TRANSLATIONS.en;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Hardcoded fallback for requested super_admin
    if (username === "super_admin" && password === "123456") {
      const adminData = { username: "super_admin", role: "admin", displayName: "Super Admin" };
      localStorage.setItem("ktd_admin", JSON.stringify(adminData));
      onLogin(adminData);
      return;
    }

    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      if (dbError) throw dbError;

      if (data) {
        const user = { username: data.username, role: data.role, displayName: data.display_name };
        localStorage.setItem("ktd_admin", JSON.stringify(user));
        onLogin(user);
      } else {
        setError(t.backend.fields.invalidCredentials);
      }
    } catch (err) {
      setError(t.backend.fields.invalidCredentials);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4 transition-colors duration-300 relative">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 p-8 md:p-12 rounded-[3rem] shadow-2xl dark:shadow-blue-900/10 border border-neutral-100 dark:border-neutral-800"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="h-16 w-32 relative mb-4 flex items-center justify-center">
              <img src="/logo.png" alt="KTD Logo" className="h-full w-auto object-contain dark:invert mix-blend-multiply dark:mix-blend-normal" />
            </div>
            <h2 className="text-3xl font-black text-blue-900 dark:text-white font-display">{t.backend.fields.login}</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 font-medium">KTD Documentation Service Terminal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">{t.backend.fields.username}</label>
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-neutral-300 dark:text-neutral-600" />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all text-sm text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-600" 
                  placeholder={t.backend.fields.username}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">{t.backend.fields.password}</label>
              <div className="relative">
                <Key className="absolute left-4 top-4 w-5 h-5 text-neutral-300 dark:text-neutral-600" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all text-sm text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-600" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-[10px] font-bold border border-red-100 dark:border-red-900/30 flex items-center gap-2 uppercase tracking-tighter"
              >
                <div className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full" /> {error}
              </motion.div>
            )}

            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 dark:hover:bg-blue-500 shadow-xl shadow-blue-200 dark:shadow-blue-900/40 active:scale-95 transition-all uppercase tracking-widest text-sm">
              {t.backend.fields.authenticate}
            </button>
          </form>
          
          <div className="mt-8 text-center pt-8 border-t border-neutral-100 dark:border-neutral-800">
            <button 
              type="button"
              onClick={() => window.location.href = '/'}
              className="text-neutral-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-bold transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t.backend.fields.backToHome}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}