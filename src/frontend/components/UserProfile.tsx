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


export function UserProfile({ user }: { user: any }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // In a real app we would use an Admin or Auth API.
      // Here we just update the 'password' field in 'users' table directly since it's the custom DB logic used in this app.
      // Wait, is there a special way auth works?
      // Since 'users' is just a table, and there's no auth shown beside the 'users' table...
      const { error } = await supabase
        .from('users')
        .update({ password })
        .eq('id', user.id);

      if (error) throw error;
      setSuccessMsg("Password updated successfully.");
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while updating the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 max-w-2xl transition-colors">
      <h2 className="font-bold text-2xl text-neutral-800 dark:text-neutral-100 font-display mb-6">User Profile</h2>
      
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-2xl font-bold uppercase">
            {user.display_name?.charAt(0) || user.username?.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{user.display_name}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">@{user.username}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'}`}>
              {user.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <h4 className="font-bold text-neutral-800 dark:text-neutral-200">Update Password</h4>
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-green-50 text-green-600 text-sm font-bold border border-green-100">
              {successMsg}
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 block mb-1 ml-1">New Password</label>
            <input 
              type="password" required value={password} minLength={6}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 block mb-1 ml-1">Confirm Password</label>
            <input 
              type="password" required value={confirmPassword} minLength={6}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-colors"
            />
          </div>
          
          <button 
            type="submit" disabled={loading || !password}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}