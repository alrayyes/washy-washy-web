import { createContext, type ReactNode, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, type Locale } from "./locales";
import { type TranslationParams, translator, type Ui } from "./ui";

type T = (key: keyof Ui, params?: TranslationParams) => string;

interface I18nContextValue {
  t: T;
  locale: Locale;
}

const I18nContext = createContext<I18nContextValue>({
  t: translator(DEFAULT_LOCALE),
  locale: DEFAULT_LOCALE,
});

/**
 * Wraps each top-level React island (SheetViewer, ConfigViewer,
 * MachineEditor) so every helper component nested inside it — Sheet.tsx's
 * Masthead/Legend/ChipRow, ConfigViewer's ChartCards, MachineEditor's
 * WasherEditor/IronEditor, and so on — can reach `t()` (and, where a link
 * needs a locale-aware href, `locale`) via `useT()`/`useLocale()` without
 * threading either as a prop through every one of their own signatures. A
 * Context, not a prop, is the right call here specifically because of how
 * many components sit between the island and a piece of hardcoded text.
 */
export function TranslationProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => ({ t: translator(locale), locale }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): T {
  return useContext(I18nContext).t;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}
