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
const setPickerOpen = ref(false);
const parsedCsv = ref<ParsedCsv | null>(null);

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
  // clone values so we can cancel safely
  draftValues.value = { ...entry.values };

  // Optional: auto-open the row when editing
  if (!entry.isOpen) store.toggleOpen(id);
}

function cancelEdit() {
  editingId.value = null;
  draftKey.value = "";
  draftValues.value = {};
}

function saveEdit(id: string) {
  store.updateKey(id, draftKey.value.trim() || "untitled.key");

  // commit all locale values in one go
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

  // start editing immediately so it’s obvious what to do next
  beginEdit(newest.id);

  // optional: clear search so it doesn't "hide" the new entry
  // store.clearSearch();
}

const jsonModalOpen = ref(false);

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

async function onCsvUploaded(file: File) {
  const result = await importTranslations(file);
  parsedCsv.value = result;

  const counts = TRANSLATION_SETS.map((s) => ({
    id: s.id,
    count: result.entries.filter((e) => e.key.startsWith(s.id + ".")).length,
  }));

  const nonEmpty = counts.filter((c) => c.count > 0);

  if (nonEmpty.length === 1) {
    applySet(nonEmpty[0].id);
    return;
  }

  setPickerOpen.value = true;
}

function applySet(setId?: string) {
  if (!parsedCsv.value) return;

  const { locales, entries } = parsedCsv.value;

  const filtered = setId
    ? entries.filter((e) => e.key.startsWith(setId + "."))
    : entries;

  store.locales = locales;
  store.entries = filtered;

  store.clearSearch();
  store.clearJsonOutput();

  setPickerOpen.value = false;
}

const setsWithCounts = computed(() => {
  if (!parsedCsv.value) {
    return TRANSLATION_SETS.map((s) => ({
      ...s,
      count: 0,
    }));
  }

  return TRANSLATION_SETS.map((s) => ({
    ...s,
    count: parsedCsv.value!.entries.filter((e) =>
      e.key.startsWith(s.id + "."),
    ).length,
  }));
});
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
      <p class="text-sm font-medium text-slate-700">
        No results found
      </p>
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
