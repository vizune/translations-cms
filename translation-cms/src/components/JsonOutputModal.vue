<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from "vue";
import JsonOutputPanel from "./JsonOutputPanel.vue";

const props = defineProps<{
  json: string;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "clear"): void;
}>();

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    window.addEventListener("keydown", onKeydown);
  },
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-label="Generated JSON"
  >
    <!-- Backdrop -->
    <button
      type="button"
      class="absolute inset-0 bg-slate-900/40"
      aria-label="Close modal"
      @click="emit('close')"
    />

    <!-- Modal -->
    <div
      class="relative mx-4 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.25)]"
    >
      <!-- Modal header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 class="text-base font-semibold text-slate-900">Generated JSON</h2>
          <p class="mt-1 text-sm text-slate-500">
            Copy or clear the output. Press Esc to close.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <!-- Keep your existing panel UI -->
      <JsonOutputPanel
        :json="json"
        @clear="emit('clear')"
      />
    </div>
  </div>
</template>
