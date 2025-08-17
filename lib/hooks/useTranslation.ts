import React, { useMemo } from 'react';
import { useGameStore } from '@/lib/state/gameStore';

// Import locale files
import enCommon from '@/locales/en/common.json';
import deCommon from '@/locales/de/common.json';

type TranslationKey = string;
type NestedTranslations = { [key: string]: string | NestedTranslations };

const translations = {
  en: { common: enCommon },
  de: { common: deCommon },
} as const;

/**
 * Get nested value from object using dot notation
 * @param obj The object to search in
 * @param path The dot-separated path (e.g., 'settings.title')
 * @returns The value at the path or the path itself if not found
 */
function getNestedValue(obj: NestedTranslations, path: string): string {
  const keys = path.split('.');
  let current: NestedTranslations | string = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // Return the key if not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

/**
 * Custom hook for translations based on game store language setting
 */
export function useTranslation(namespace: keyof typeof translations.en = 'common') {
  const { settings } = useGameStore();
  const currentLanguage = settings.language.toLowerCase() as 'en' | 'de';
  
  const t = useMemo(() => {
    return (key: TranslationKey, fallback?: string): string => {
      const namespaceTranslations = translations[currentLanguage]?.[namespace];
      if (!namespaceTranslations) {
        return fallback || key;
      }
      
      const translation = getNestedValue(namespaceTranslations, key);
      return translation || fallback || key;
    };
  }, [currentLanguage, namespace]);
  
  const language = currentLanguage;
  const isEnglish = language === 'en';
  const isGerman = language === 'de';
  
  return {
    t,
    language,
    isEnglish,
    isGerman,
  };
}

/**
 * Higher-order component to provide translation context
 */
export function withTranslation<T extends Record<string, unknown>>(
  Component: React.ComponentType<T & { t: ReturnType<typeof useTranslation>['t'] }>
) {
  return function WrappedComponent(props: T) {
    const translation = useTranslation();
    return React.createElement(Component, { ...props, t: translation.t });
  };
}

/**
 * Format a string with interpolation
 * @param template The template string with {{key}} placeholders
 * @param values Object with values to interpolate
 * @returns Formatted string
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}