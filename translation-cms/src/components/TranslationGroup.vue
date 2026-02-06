<script setup lang="ts">
import { ref } from "vue";
import { useTranslationsStore } from "../stores/translations";
import SearchBar from "./SearchBar.vue";
import JsonOutputPanel from "./JsonOutputPanel.vue";

const store = useTranslationsStore();

const editingId = ref<string | null>(null);
const draftKey = ref("");

function startEdit(id: string, currentKey: string) {
  editingId.value = id;
  draftKey.value = currentKey;
}

function saveEdit(id: string) {
  store.updateKey(id, draftKey.value.trim() || "untitled.key");
  editingId.value = null;
}

function cancelEdit() {
  editingId.value = null;
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
          Click a key to edit, expand to edit locale values.
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
            class="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.98]"
            @click="store.generateJson"
          >
            Generate
          </button>

          <!-- Plus button -->
          <button
            type="button"
            aria-label="Add translation"
            @click="store.addEntry"
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
      <li v-for="entry in store.filteredEntries" :key="entry.id" class="border-t border-slate-100 first:border-t-0">

        <!-- Row -->
        <div class="grid grid-cols-[44px_1fr] items-center px-3 py-2">
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            @click="store.toggleOpen(entry.id)"
            :aria-expanded="entry.isOpen"
          >
            <span
              class="inline-block text-lg transition-transform duration-150 ease-in-out"
              :class="entry.isOpen ? 'rotate-90' : 'rotate-0'"
            >
              ›
            </span>
          </button>

          <div class="min-w-0">
            <!-- View mode: key button -->
            <button
              v-if="editingId !== entry.id"
              type="button"
              class="block w-full truncate rounded-xl px-3 py-2 text-left font-semibold text-slate-900 hover:bg-slate-50"
              :title="`Edit key: ${entry.key}`"
              @click="startEdit(entry.id, entry.key)"
            >
              {{ entry.key }}
            </button>

            <!-- Edit mode -->
            <div v-else class="flex flex-wrap items-center gap-2 px-3 py-1">
              <input
                v-model="draftKey"
                type="text"
                class="h-10 w-full min-w-[240px] flex-1 rounded-xl border border-slate-200 px-3 text-slate-900 outline-none focus:border-slate-400"
                @keydown.enter.prevent="saveEdit(entry.id)"
                @keydown.esc.prevent="cancelEdit"
                autofocus
              />

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="h-10 rounded-xl border border-slate-200 bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 active:scale-[0.99]"
                  @click="saveEdit(entry.id)"
                >
                  Save
                </button>
                <button
                  type="button"
                  class="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50 active:scale-[0.99]"
                  @click="cancelEdit"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Expanded content -->
        <div v-if="entry.isOpen" class="px-3 pb-4 pl-14">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label v-for="locale in store.locales" :key="locale" class="grid gap-1.5">
              <span class="text-xs font-medium text-slate-500">{{ locale }}</span>
              <input
                class="h-10 w-full rounded-xl border border-slate-200 px-3 text-slate-900 outline-none focus:border-slate-400"
                type="text"
                :value="entry.values[locale] ?? ''"
                @input="store.updateValue(entry.id, locale, ($event.target as HTMLInputElement).value)"
              />
            </label>
          </div>
        </div>
      </li>
    </ul>

    <JsonOutputPanel
      v-if="store.jsonOutput"
      :json="store.jsonOutput"
      @clear="store.clearJsonOutput"
    />
  </section>
</template>
