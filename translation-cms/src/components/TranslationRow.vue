<script setup lang="ts">
import type { TranslationEntry, LocaleCode } from "../stores/translations";
import TranslationRowView from "./TranslationRowView.vue";
import TranslationRowEdit from "./TranslationRowEdit.vue";

const props = defineProps<{
  entry: TranslationEntry;
  locales: LocaleCode[];

  isEditing: boolean;
  draftKey: string;
  draftValues: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: "toggle"): void;
  (e: "edit"): void;
  (e: "updateKey", value: string): void;
  (e: "updateValue", locale: string, value: string): void;
  (e: "save"): void;
  (e: "cancel"): void;
}>();
</script>

<template>
  <li
    class="border-t border-slate-100 first:border-t-0"
    :class="isEditing ? 'bg-slate-50' : 'bg-white'"
  >
    <div class="grid grid-cols-[44px_1fr_auto] items-center gap-2 px-3 py-2">
      <!-- Expand toggle (always shown) -->
      <button
        type="button"
        class="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
        @click="emit('toggle')"
        :aria-expanded="entry.isOpen"
        :aria-label="entry.isOpen ? 'Collapse' : 'Expand'"
      >
        <span
          class="inline-block text-lg transition-transform duration-150 ease-in-out"
          :class="entry.isOpen ? 'rotate-90' : 'rotate-0'"
        >
          ›
        </span>
      </button>

      <!-- View/Edit key + actions -->
      <TranslationRowView
        v-if="!isEditing"
        :entry="entry"
        @edit="emit('edit')"
      />

      <TranslationRowEdit
        v-else
        :draft-key="draftKey"
        :is-new="entry.isNew"
        @updateKey="(v) => emit('updateKey', v)"
        @save="emit('save')"
        @cancel="emit('cancel')"
      />
    </div>

    <!-- Expanded content -->
    <div v-if="entry.isOpen" class="px-3 pb-4 pl-14">
      <div v-if="!isEditing">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div v-for="locale in locales" :key="locale" class="grid gap-1.5">
            <span class="text-xs font-medium text-slate-500">{{ locale }}</span>
            <div class="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-900">
              {{ entry.values[locale] || "—" }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label v-for="locale in locales" :key="locale" class="grid gap-1.5">
          <span class="text-xs font-medium text-slate-500">{{ locale }}</span>
          <input
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-slate-400"
            type="text"
            :value="draftValues[locale] ?? ''"
            @input="emit('updateValue', locale, ($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>
    </div>
  </li>
</template>
