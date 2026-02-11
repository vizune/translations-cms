<script setup lang="ts">
import { computed, ref } from "vue";
import SearchBar from "./SearchBar.vue";

const props = defineProps<{
  allExpanded: boolean;
}>();

const emit = defineEmits<{
  (e: "toggleViewAll"): void;
  (e: "generate"): void;
  (e: "add"): void;
  (e: "importCsv", file: File): void;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);

function openFilePicker() {
  fileInputRef.value?.click();
}

function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  emit("importCsv", file);

  // allow re-uploading the same file without refreshing
  input.value = "";
}

const viewAllLabel = computed(() =>
  props.allExpanded ? "Collapse all" : "View all",
);
</script>

<template>
  <header class="border-b border-slate-100 px-5 py-4">
    <!-- Row 1: Title + subtitle -->
    <div class="mb-4">
      <h1 class="text-lg font-semibold text-slate-900">Translations</h1>
      <p class="mt-1 text-sm text-slate-500">
        Expand to view values. Click Edit to make changes.
      </p>
    </div>

    <!-- Row 2: Controls -->
    <div class="flex items-center gap-3">
      <SearchBar class="flex-1" />

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 active:scale-[0.98]"
          @click="openFilePicker"
        >
          Upload CSV
        </button>

        <input
          ref="fileInputRef"
          type="file"
          accept=".csv"
          class="hidden"
          @change="onFilePicked"
        />

        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 active:scale-[0.98]"
          @click="emit('toggleViewAll')"
        >
          {{ viewAllLabel }}
        </button>

        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.98]"
          @click="emit('generate')"
        >
          Generate
        </button>

        <button
          type="button"
          aria-label="Add translation"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-base leading-none hover:bg-slate-100 active:scale-[0.98]"
          @click="emit('add')"
        >
          ➕
        </button>
      </div>
    </div>
  </header>
</template>
