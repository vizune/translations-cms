<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  json: string;
}>();

const emit = defineEmits<{
  (e: "clear"): void;
}>();

const copied = ref(false);

async function copyJson() {
  if (!props.json) return;

  try {
    await navigator.clipboard.writeText(props.json);
    copied.value = true;

    window.setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch (err) {
    // Fallback: select text so the user can Ctrl+C
    const el = document.getElementById("json-output") as HTMLTextAreaElement | null;
    if (el) {
      el.focus();
      el.select();
    }
    console.error("Failed to copy JSON:", err);
  }
}
</script>

<template>
  <div class="border-t border-slate-100 px-5 py-4">
    <div class="mb-2 flex items-center justify-between">
      <p class="text-sm font-semibold text-slate-900">
        Generated JSON
      </p>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          @click="copyJson"
        >
          <span v-if="!copied">Copy</span>
          <span v-else class="text-emerald-600">Copied!</span>
        </button>

        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          @click="emit('clear')"
        >
          Clear
        </button>
      </div>
    </div>

    <textarea
      id="json-output"
      class="h-56 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 outline-none focus:border-slate-400"
      :value="json"
      readonly
    />
  </div>
</template>
