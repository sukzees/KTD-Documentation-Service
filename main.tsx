import { createContext } from "react";
import { TRANSLATIONS, type Language } from "../translations";

export const LanguageContext = createContext<{ lang: Language; setLang: (l: Language) => void; t: typeof TRANSLATIONS.lao } | null>(null);
export const ThemeContext = createContext<{ isDark: boolean; toggleTheme: () => void } | null>(null);
