<script setup lang="ts">
import { computed } from "vue";
import { useTranslationsStore } from "../stores/translations";

const store = useTranslationsStore();

const resultsText = computed(() => {
  return `${store.filteredEntries.length}/${store.entries.length}`;
});

function onInput(e: Event) {
  store.setSearchQuery((e.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="flex w-full items-center gap-2">
    <div class="relative w-full">
      <input
        :value="store.searchQuery"
        type="text"
        placeholder="Search keys or values…"
        class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
        @input="onInput"
      />

      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
        🔎
      </span>

      <button
        v-if="store.searchQuery"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
        @click="store.clearSearch"
        aria-label="Clear search"
      >
        Clear
      </button>
    </div>

    <span class="whitespace-nowrap text-xs text-slate-500">
      {{ resultsText }}
    </span>
  </div>
</template>
