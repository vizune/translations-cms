<script setup lang="ts">
import type { TranslationEntry } from "../stores/translations";

defineProps<{
  entry: TranslationEntry;
}>();

const emit = defineEmits<{
  (e: "edit"): void;
}>();
</script>

<template>
  <div class="min-w-0">
    <div class="flex items-center gap-2 px-3 py-2">
        <p class="min-w-0 flex-1 truncate font-semibold text-slate-900" :title="entry.key">
            {{ entry.key }}
        </p>

        <span
            v-if="entry.isNew"
            class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
        >
            NEW
        </span>
    </div>
  </div>

  <div class="flex items-center gap-2 pr-1">
    <button
      type="button"
      class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      @click="emit('edit')"
      aria-label="Edit translation"
      title="Edit"
    >
      ✏️
    </button>
  </div>
</template>
