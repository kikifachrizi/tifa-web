"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Dictionary, en, id } from "@/lib/dictionaries";
import { forgixEn, forgixId, ForgixDictionary } from "@/lib/dictionaries-forgix";
import { tifaEn, tifaId, TifaDictionary } from "@/lib/dictionaries-tifa";

type Language = "en" | "id";

interface LanguageContextType {
    language: Language;
    dict: Dictionary;
    forgixDict: ForgixDictionary;
    tifaDict: TifaDictionary;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Pre-compute dictionaries map for O(1) lookup
const dictionaries: Record<Language, Dictionary> = {
    en,
    id
};

const forgixDictionaries: Record<Language, ForgixDictionary> = {
    en: forgixEn,
    id: forgixId
};

const tifaDictionaries: Record<Language, TifaDictionary> = {
    en: tifaEn,
    id: tifaId
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("id");
    const [mounted, setMounted] = useState(false);

    // Initial load from localStorage - runs once
    useEffect(() => {
        const savedLang = localStorage.getItem("tifa_language") as Language;
        if (savedLang && (savedLang === "en" || savedLang === "id")) {
            setLanguageState(savedLang);
        }
        setMounted(true);
    }, []);

    // Memoized setLanguage callback
    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("tifa_language", lang);
    }, []);

    // Memoized dictionary lookup
    const dict = useMemo(() => dictionaries[language], [language]);
    const forgixDict = useMemo(() => forgixDictionaries[language], [language]);
    const tifaDict = useMemo(() => tifaDictionaries[language], [language]);

    // Memoized context value
    const value = useMemo(() => ({
        language,
        dict,
        forgixDict,
        tifaDict,
        setLanguage
    }), [language, dict, forgixDict, tifaDict, setLanguage]);

    // Prevent flash of wrong language
    if (!mounted) {
        return null;
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
