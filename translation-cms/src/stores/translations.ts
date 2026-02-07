import { defineStore } from "pinia";

export type LocaleCode = string;

export type TranslationEntry = {
  id: string;
  key: string;
  values: Record<LocaleCode, string>;
  isOpen: boolean;
  isNew?: boolean;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const useTranslationsStore = defineStore("translations", {
  state: () => ({
    locales: ["en-GB", "en-US"] as LocaleCode[],
    entries: [
      {
        id: "seed-1",
        key: "homepage.title",
        values: { "en-GB": "Welcome", "en-US": "Welcome" },
        isOpen: false,
      },
      {
        id: "seed-2",
        key: "homepage.subtitle",
        values: { "en-GB": "Hello there", "en-US": "Hey there" },
        isOpen: false,
      },
    ] as TranslationEntry[],
    searchQuery: "",
    jsonOutput: "",
  }),

  getters: {
    filteredEntries(state) {
      const q = state.searchQuery.trim().toLowerCase();
      if (!q) return state.entries;

      return state.entries.filter((entry) => {
        const keyMatch = entry.key.toLowerCase().includes(q);

        const valuesMatch = Object.values(entry.values).some((v) =>
          (v ?? "").toLowerCase().includes(q),
        );

        return keyMatch || valuesMatch;
      });
    },
  },

  actions: {
    setSearchQuery(next: string) {
      this.searchQuery = next;
    },
    toggleOpen(id: string) {
      const entry = this.entries.find((e) => e.id === id);
      if (entry) entry.isOpen = !entry.isOpen;
    },
    updateKey(id: string, nextKey: string) {
      const entry = this.entries.find((e) => e.id === id);
      if (entry) {
        entry.key = nextKey;
        entry.isNew = false;
      }
    },
    updateValue(id: string, locale: LocaleCode, value: string) {
      const entry = this.entries.find((e) => e.id === id);
      if (entry) entry.values[locale] = value;
    },
    addEntry() {
      const blankValues = Object.fromEntries(this.locales.map((l) => [l, ""]));
      this.entries.unshift({
        id: uid(),
        key: "new.key",
        values: blankValues,
        isOpen: true,
        isNew: true,
      });
    },
    addLocale(locale: LocaleCode) {
      if (this.locales.includes(locale)) return;
      this.locales.push(locale);
      for (const entry of this.entries) {
        entry.values[locale] = "";
      }
    },
    clearSearch() {
      this.searchQuery = "";
    },
    generateJson() {
      // Shape: { "key.path": { "en-GB": "...", "en-US": "..." } }
      const output: Record<string, Record<string, string>> = {};

      for (const entry of this.entries) {
        const key = entry.key.trim();
        if (!key) continue;

        // Ensure all locales exist in the output (even if blank)
        const values: Record<string, string> = {};
        for (const locale of this.locales) {
          values[locale] = entry.values[locale] ?? "";
        }

        output[key] = values;
      }

      this.jsonOutput = JSON.stringify(output, null, 2);
    },
    clearJsonOutput() {
      this.jsonOutput = "";
    },
    expandAll() {
      for (const entry of this.entries) entry.isOpen = true;
    },
    collapseAll() {
      for (const entry of this.entries) entry.isOpen = false;
    },
  },
});
