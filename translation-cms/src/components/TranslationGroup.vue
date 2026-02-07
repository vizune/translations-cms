<script setup lang="ts">
import { computed, ref } from "vue";
import { useTranslationsStore } from "../stores/translations";
import SearchBar from "./SearchBar.vue";
import JsonOutputPanel from "./JsonOutputPanel.vue";
import TranslationRow from "./TranslationRow.vue";

const store = useTranslationsStore();

const editingId = ref<string | null>(null);
const draftKey = ref("");
const draftValues = ref<Record<string, string>>({});

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
</script>

<template>
  <section
    class="mx-auto mt-8 max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
  >
    <!-- Header -->
    <header class="border-b border-slate-100 px-5 py-4">
      <!-- Row 1: Title + subtitle -->
      <div class="mb-4">
        <h1 class="text-lg font-semibold text-slate-900">
          Translations
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Expand to view values. Click Edit to make changes.
        </p>
      </div>

      <!-- Row 2: Controls -->
      <div class="flex items-center gap-3">
        <!-- Search -->
        <SearchBar class="flex-1" />

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 active:scale-[0.98]"
            @click="toggleViewAll"
          >
            {{ allExpanded ? "Collapse all" : "View all" }}
          </button>
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.98]"
            @click="store.generateJson"
          >
            Generate
          </button>

          <!-- Plus button -->
          <button
            type="button"
            aria-label="Add translation"
            @click="addNewEntry"
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-base leading-none hover:bg-slate-100 active:scale-[0.98]"
          >
            ➕
          </button>
        </div>
      </div>
    </header>


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

    <JsonOutputPanel
      v-if="store.jsonOutput"
      :json="store.jsonOutput"
      @clear="store.clearJsonOutput"
    />
  </section>
</template>
