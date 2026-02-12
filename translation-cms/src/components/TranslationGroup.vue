<script setup lang="ts">
import { computed, ref } from "vue";
import { TRANSLATION_SETS } from "../config/translationSets";
import { useTranslationsStore } from "../stores/translations";
import { importTranslations } from "../utils/importTranslations";
import JsonOutputModal from "./JsonOutputModal.vue";
import TranslationSetModal from "./TranslationSetModal.vue";
import TranslationRow from "./TranslationRow.vue";
import TranslationsHeader from "./TranslationsHeader.vue";

type ParsedCsv = Awaited<ReturnType<typeof importTranslations>>;

const store = useTranslationsStore();

const editingId = ref<string | null>(null);
const draftKey = ref("");
const draftValues = ref<Record<string, string>>({});

// CSV import + set selection
const setPickerOpen = ref(false);
const parsedCsv = ref<ParsedCsv | null>(null);
const selectedSetId = ref<string | null>(null);

// JSON modal
const jsonModalOpen = ref(false);

const allExpanded = computed(() =>
  store.filteredEntries.length > 0 &&
  store.filteredEntries.every((e) => e.isOpen),
);

function toggleViewAll() {
  if (allExpanded.value) store.collapseAll();
  else store.expandAll();
}

function beginEdit(id: string) {
  const entry = store.entries.find((e) => e.id === id);
  if (!entry) return;

  editingId.value = id;
  draftKey.value = entry.key;
  draftValues.value = { ...entry.values };

  if (!entry.isOpen) store.toggleOpen(id);
}

function cancelEdit() {
  editingId.value = null;
  draftKey.value = "";
  draftValues.value = {};
}

function saveEdit(id: string) {
  store.updateKey(id, draftKey.value.trim() || "untitled.key");

  for (const locale of store.locales) {
    store.updateValue(id, locale, draftValues.value[locale] ?? "");
  }

  cancelEdit();
}

function updateDraftValue(locale: string, value: string) {
  draftValues.value = { ...draftValues.value, [locale]: value };
}

const isEditing = (id: string) => editingId.value === id;

function addNewEntry() {
  store.addEntry();

  const newest = store.entries[0];
  if (!newest) return;

  beginEdit(newest.id);
}

function generateAndOpenJson() {
  store.generateJson();
  jsonModalOpen.value = true;
}

function closeJsonModal() {
  jsonModalOpen.value = false;
}

function clearJsonAndClose() {
  store.clearJsonOutput();
  jsonModalOpen.value = false;
}

/**
 * Build counts based on set id as a key prefix (e.g. "shared-translations.foo")
 * If your spreadsheet sets are NOT prefixes, tell me and we’ll switch strategy.
 */
function countKeysForSet(entries: ParsedCsv["entries"], setId: string) {
  const prefix = setId + ".";
  return entries.reduce((acc, e) => (e.key.startsWith(prefix) ? acc + 1 : acc), 0);
}

const setsWithCounts = computed(() => {
  const entries = parsedCsv.value?.entries ?? [];
  return TRANSLATION_SETS.map((s) => ({
    ...s,
    count: countKeysForSet(entries, s.id),
  }));
});

async function onCsvUploaded(file: File) {
  const result = await importTranslations(file);
  parsedCsv.value = result;

  // If exactly one set matches keys in this file, auto-select it
  const nonEmpty = TRANSLATION_SETS
    .map((s) => ({ id: s.id, count: countKeysForSet(result.entries, s.id) }))
    .filter((x) => x.count > 0);

  if (nonEmpty.length === 1) {
    applySet(nonEmpty[0].id);
    return;
  }

  // Otherwise ask user which set this CSV belongs to
  setPickerOpen.value = true;
}

function applySet(setId: string) {
  selectedSetId.value = setId;

  if (!parsedCsv.value) return;

  const prefix = setId + ".";
  const filteredEntries = parsedCsv.value.entries.filter((e) =>
    e.key.startsWith(prefix),
  );

  // If filtering yields nothing (e.g. set isn't a prefix), fall back to "all"
  store.locales = parsedCsv.value.locales;
  store.entries = filteredEntries.length > 0 ? filteredEntries : parsedCsv.value.entries;

  store.clearSearch();
  store.clearJsonOutput();

  setPickerOpen.value = false;
}
</script>

<template>
  <section
    class="mx-auto mt-8 max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
  >
    <TranslationsHeader
      :all-expanded="allExpanded"
      @toggleViewAll="toggleViewAll"
      @generate="generateAndOpenJson"
      @add="addNewEntry"
      @importCsv="onCsvUploaded"
    />

    <!-- Empty state -->
    <div
      v-if="store.searchQuery && store.filteredEntries.length === 0"
      class="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <p class="text-sm font-medium text-slate-700">No results found</p>
      <p class="mt-1 text-sm text-slate-500">
        Nothing matches “<span class="font-mono">{{ store.searchQuery }}</span>”
      </p>

      <button
        type="button"
        class="mt-4 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
        @click="store.clearSearch"
      >
        Clear search
      </button>
    </div>

    <!-- Accordion list -->
    <ul v-else class="m-0 list-none p-0">
      <TranslationRow
        v-for="entry in store.filteredEntries"
        :key="entry.id"
        :entry="entry"
        :locales="store.locales"
        :is-editing="isEditing(entry.id)"
        :draft-key="draftKey"
        :draft-values="draftValues"
        @toggle="store.toggleOpen(entry.id)"
        @edit="beginEdit(entry.id)"
        @updateKey="draftKey = $event"
        @updateValue="(locale, value) => updateDraftValue(locale, value)"
        @save="saveEdit(entry.id)"
        @cancel="cancelEdit"
      />
    </ul>
  </section>

  <TranslationSetModal
    :open="setPickerOpen"
    :sets="setsWithCounts"
    @close="setPickerOpen = false"
    @select="applySet"
  />

  <JsonOutputModal
    :open="jsonModalOpen && !!store.jsonOutput"
    :json="store.jsonOutput"
    @close="closeJsonModal"
    @clear="clearJsonAndClose"
  />
</template>
