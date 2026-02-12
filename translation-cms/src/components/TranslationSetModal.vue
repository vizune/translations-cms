<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  sets: { id: string; count: number }[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select", setId: string): void;
}>();
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <button
      type="button"
      class="absolute inset-0 bg-slate-900/40"
      @click="emit('close')"
      aria-label="Close"
    />

    <div class="relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
      <div class="border-b border-slate-100 px-5 py-4">
        <h2 class="text-base font-semibold text-slate-900">Choose a translation set</h2>
        <p class="mt-1 text-sm text-slate-500">
          Pick which key group you want to edit (based on the prefix before the first dot).
        </p>
      </div>

      <div class="max-h-[60vh] overflow-auto p-3">
        <button
          v-for="s in sets"
          :key="s.id"
          type="button"
          class="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50"
          @click="emit('select', s.id)"
        >
          <span class="font-mono text-sm text-slate-900">{{ s.id }}</span>
          <span class="text-sm text-slate-500">{{ s.count }} keys</span>
        </button>
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50"
          @click="emit('close')"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
