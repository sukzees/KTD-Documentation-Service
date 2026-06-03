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


export function ProcessVisualizer() {
  const context = useContext(LanguageContext);
  const t = context?.t.process || TRANSLATIONS.lao.process;
  const [isProcessLoading, setIsProcessLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const stepsList = (t as any).steps || [
    { title: "ເຊັນສັນຍາກັບທາງບໍລິສັດ", desc: "ເລີ່ມຕົ້ນຂໍ້ຕົກລົງ ແລະ ເຊັນສັນຍາກັບພວກເຮົາເພື່ອຮັບປະກັນຄວາມໜ້າເຊື່ອຖື ແລະ ຄວາມປອດໄພຂອງເອກະສານ" },
    { title: "ກະກຽມເອກະສານໃຫ້ຄົບຖ້ວນ", desc: "ລວບລວມ ແລະ ກວດເຊັກເອກະສານທີ່ຈຳເປັນທັງໝົດໃຫ້ຄົບຖ້ວນຕາມຂໍ້ກຳນົດ" },
    { title: "ກວດສອບເອກະສານຂອງລູກຄ້າ", desc: "ທີມງານຜູ້ຊ່ຽວຊານກວດສອບຄວາມຖືກຕ້ອງ ແລະ ຮຽບຮ້ອຍຂອງເອກະສານກ່ອນດຳເນີນການ" },
    { title: "ດຳເນີນການແລ່ນເອກະສານ", desc: "ປະສານງານ ແລະ ຍື່ນເອກະສານກັບໜ່ວຍງານລັດຖະການທີ່ກ່ຽວຂ້ອງຢ່າງວ່ອງໄວ" },
    { title: "ລູກຄ້າມາຮັບເອກະສານຫຼັງຈາກເອກະສານສຳເລັດ", desc: "ຮັບເອກະສານທີ່ສຳເລັດຮຽບຮ້ອຍຢ່າງຄົບຖ້ວນ ແລະ ປອດໄພດ້ວຍຕົນເອງ" }
  ];

  const getStepIcon = (index: number) => {
    switch (index) {
      case 0: return <FileCheck className="w-6 h-6 text-blue-400 group-hover:text-amber-400 transition-colors" />;
      case 1: return <FileText className="w-6 h-6 text-blue-400 group-hover:text-amber-400 transition-colors" />;
      case 2: return <UserCheck className="w-6 h-6 text-blue-400 group-hover:text-amber-400 transition-colors" />;
      case 3: return <Zap className="w-6 h-6 text-blue-400 group-hover:text-amber-400 transition-colors" />;
      case 4: return <CheckCircle2 className="w-6 h-6 text-blue-400 group-hover:text-amber-400 transition-colors" />;
      default: return <FileText className="w-6 h-6 text-blue-400 group-hover:text-amber-400 transition-colors" />;
    }
  };

  const loadingMessages = t.loadingMessages || [];

  useEffect(() => {
    const checkKey = async () => {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    };
    checkKey();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % (loadingMessages.length || 1));
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isProcessLoading, loadingMessages.length]);

  const handleOpenKeyDialog = async () => {
    await window.aistudio.openSelectKey();
    setHasApiKey(true);
  };

  const generateProcessFlow = async () => {
    setIsProcessLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = "A high-quality 4k 3D animation showing a seamless document management process. Visualizing folders flowing from a customer to a digital cloud, then being verified by a professional team, and finally returning as a golden-sealed document to a happy client. Cinematic lighting, professional aesthetic, 16:9.";

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed to return a link");

      const response = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch the generated video file");

      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      setVideoUrl(localUrl);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setError(t.keyError);
        setHasApiKey(false);
      } else {
        setError(t.genError + err.message);
      }
    } finally {
      setIsProcessLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 dark:bg-neutral-900/40 backdrop-blur-md rounded-[3rem] p-8 md:p-12 text-white overflow-hidden relative border border-white/10 shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 blur-[120px] opacity-10 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 text-blue-200 px-4 py-2 rounded-full text-xs font-bold mb-6 border border-blue-400/20 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            {t.badge}
          </div>
          <h3 className="text-3xl md:text-5xl font-black mb-4 font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200 leading-relaxed md:leading-[1.5]">{t.title}</h3>
          <p className="text-blue-100/70 text-base md:text-lg font-medium">{t.subtitle}</p>
        </div>

        {/* 5-Step Connected Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute left-4 right-4 top-14 h-0.5 border-t border-dashed border-blue-400/30 pointer-events-none" />

          {stepsList.map((step: any, index: number) => {
            const isActive = activeStep === index;
            return (
              <motion.div
                key={index}
                onClick={() => setActiveStep(index)}
                className={`cursor-pointer group flex flex-col items-center text-center p-6 rounded-3xl border transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-blue-600/35 border-blue-400 shadow-xl shadow-blue-500/10 scale-[1.03]' 
                    : 'bg-white/5 border-white/[0.06] hover:bg-white/10 hover:border-white/10'
                }`}
                whileHover={{ y: -4 }}
              >
                {/* Step Connector Indicator */}
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-[9px] font-black rounded-full uppercase tracking-widest text-white shadow-sm">
                    Active
                  </div>
                )}

                {/* Step Number Badge and Icon */}
                <div className="relative mb-4 flex justify-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 rotate-3' 
                      : 'bg-blue-950/80 border border-blue-500/20 text-blue-400 group-hover:scale-110'
                  }`}>
                    {getStepIcon(index)}
                  </div>
                  <span className="absolute -bottom-2 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black shadow-sm">
                    0{index + 1}
                  </span>
                </div>

                {/* Step Context */}
                <h4 className="font-bold text-sm text-white group-hover:text-blue-200 transition-colors mb-2 leading-snug">
                  {step.title}
                </h4>
                <p className={`text-[11px] leading-relaxed transition-all duration-300 line-clamp-3 md:line-clamp-none ${isActive ? 'text-blue-100 font-semibold' : 'text-neutral-400'}`}>
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Active Step Spotlight Detail Card */}
        <AnimatePresence mode="wait">
          {activeStep !== null && (
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-blue-950/60 to-slate-950/60 border border-blue-500/20 p-8 rounded-[2.5rem] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] pointer-events-none" />
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
                  {getStepIcon(activeStep)}
                </div>
                <div className="space-y-3 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Step 0{activeStep + 1} of 05</span>
                    <span className="h-4 w-px bg-white/20 hidden md:block" />
                    <span className="text-white/60 text-xs font-semibold">KTD Modern Documentation Pipeline</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-white font-display">
                    {stepsList[activeStep].title}
                  </h4>
                  <p className="text-neutral-300 text-sm leading-relaxed max-w-4xl">
                    {stepsList[activeStep].desc}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}