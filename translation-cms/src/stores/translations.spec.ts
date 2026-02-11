import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTranslationsStore } from "./translations";

describe("translations store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("adds a new entry and opens it", () => {
    const store = useTranslationsStore();
    const before = store.entries.length;
  
    store.addEntry();
  
    expect(store.entries.length).toBe(before + 1);
  
    const newest = store.entries[0];
    expect(newest.isOpen).toBe(true);
  });

  it("updates a locale value", () => {
    const store = useTranslationsStore();
    const first = store.entries[0];

    store.updateValue(first.id, "en-GB", "Hello");
    expect(store.entries[0].values["en-GB"]).toBe("Hello");
  });
});
