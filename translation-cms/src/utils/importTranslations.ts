import Papa from "papaparse";
import type { LocaleCode, TranslationEntry } from "../stores/translations";

type ImportResult = {
  locales: LocaleCode[];
  entries: TranslationEntry[];
  duplicateKeys: number;
  sets: { id: string; count: number }[];
};

const normalize = (v: unknown) =>
  String(v ?? "")
    .replace(/\u00a0/g, " ") // NBSP -> normal space
    .trim();

function getSetIdFromKey(key: string) {
  const firstDot = key.indexOf(".");
  if (firstDot <= 0) return "unknown";
  return key.slice(0, firstDot).trim() || "unknown";
}

export function importTranslations(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer;

        // Decode properly (fixes ñ, é, ï, ’ etc. from Windows-1252 exports)
        const decoder = new TextDecoder("windows-1252");
        const text = decoder.decode(buffer);

        Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,

          complete: (result) => {
            const fields = (result.meta.fields ?? []).map(normalize);

            // Find key column (tolerant match)
            const keyHeader =
              fields.find((h) => h.toLowerCase().includes("identifier/key")) ??
              "Identifier/Key: Dev only";

            const keyIndex = fields.indexOf(keyHeader);
            if (keyIndex === -1) {
              reject(
                new Error(
                  `Couldn't find the key column. Expected something like "Identifier/Key: Dev only".`,
                ),
              );
              return;
            }

            // Locale headers come after key until the first blank header
            const locales: LocaleCode[] = [];
            for (let i = keyIndex + 1; i < fields.length; i++) {
              const h = normalize(fields[i]);
              if (!h) break;
              locales.push(h as LocaleCode);
            }

            const map = new Map<string, TranslationEntry>();
            let duplicates = 0;

            // Collect sets (prefix before first dot)
            const setCounts = new Map<string, number>();

            for (const row of result.data) {
              const key = normalize(row[keyHeader]);
              if (!key) continue;

              if (map.has(key)) duplicates++;

              const setId = getSetIdFromKey(key);
              setCounts.set(setId, (setCounts.get(setId) ?? 0) + 1);

              const values: Record<LocaleCode, string> = {} as any;
              for (const locale of locales) {
                values[locale] = normalize(row[locale]);
              }

              // De-dupe: last row wins
              map.set(key, {
                id: crypto.randomUUID(),
                key,
                values,
                isOpen: false,
              });
            }

            const sets = Array.from(setCounts.entries())
              .map(([id, count]) => ({ id, count }))
              .sort((a, b) => b.count - a.count);

            resolve({
              locales,
              entries: Array.from(map.values()),
              duplicateKeys: duplicates,
              sets,
            });
          },

          error: (err) => reject(err),
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
