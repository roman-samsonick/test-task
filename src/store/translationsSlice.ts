import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RawTranslation, RawTranslationsMessage } from '../types/rawTypes.ts';

/**
 * Словари накапливаются, а не заменяются: блок `translation` внутри пакета
 * покрывает только id этого пакета (замерено: 303 из 406 турниров,
 * 1681 из 2418 участников), а полный словарь приходит по subscribe-Translations.
 */
export interface Dictionaries {
  /** Ключ — ВНЕШНИЙ id участника (eid / Iid), не внутренний. */
  participants: Record<string, string>;
  tournaments: Record<string, string>;
  sports: Record<string, string>;
  countries: Record<string, string>;
}

export interface TranslationsState {
  locale: string;
  dictionaries: Dictionaries;
}

const emptyDictionaries = (): Dictionaries => ({
  participants: {},
  tournaments: {},
  sports: {},
  countries: {},
});

const initialState: TranslationsState = { locale: '', dictionaries: emptyDictionaries() };

function mergeSection(target: Record<string, string>, source?: Record<string, string>): void {
  if (!source) return;
  for (const [id, name] of Object.entries(source)) target[id] = name;
}

function mergeTranslation(target: Dictionaries, source?: RawTranslation): void {
  if (!source) return;
  mergeSection(target.participants, source.participants);
  mergeSection(target.tournaments, source.tournaments);
  mergeSection(target.sports, source.sports);
  mergeSection(target.countries, source.countries);
}

const translationsSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    /** Принимает и блок `translation` из любого пакета, и ответ Translations. */
    translationsReceived(state, action: PayloadAction<RawTranslationsMessage>) {
      const message = action.payload;

      // Смена языка обнуляет словари: id те же, значения от другой локали.
      if (message.locale && message.locale !== state.locale) {
        state.locale = message.locale;
        state.dictionaries = emptyDictionaries();
      }

      mergeTranslation(state.dictionaries, message.translation);
      mergeTranslation(state.dictionaries, message.prelive);
      mergeTranslation(state.dictionaries, message.live);
      mergeTranslation(state.dictionaries, message.finished);
    },
  },
  selectors: {
    selectDictionaries: (state) => state.dictionaries,
    selectLocale: (state) => state.locale,
  },
});

export const { translationsReceived } = translationsSlice.actions;
export const { selectDictionaries, selectLocale } = translationsSlice.selectors;

export default translationsSlice.reducer;
