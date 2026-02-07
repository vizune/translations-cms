<script setup lang="ts">
defineProps<{
  draftKey: string;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  (e: "updateKey", value: string): void;
  (e: "save"): void;
  (e: "cancel"): void;
}>();
</script>

<template>
  <div class="min-w-0 flex items-center gap-2">
    <input
      class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-900 outline-none focus:border-slate-400"
      type="text"
      :value="draftKey"
      @input="emit('updateKey', ($event.target as HTMLInputElement).value)"
      @keydown.enter.prevent="emit('save')"
      @keydown.esc.prevent="emit('cancel')"
      autofocus
    />

    <span
      v-if="isNew"
      class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
    >
      NEW
    </span>
  </div>

  <div class="flex items-center gap-2 pr-1">
    <button
      type="button"
      class="h-9 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 active:scale-[0.99]"
      @click="emit('save')"
    >
      Save
    </button>
    <button
      type="button"
      class="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 active:scale-[0.99]"
      @click="emit('cancel')"
    >
      Cancel
    </button>
  </div>
</template>
