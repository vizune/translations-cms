import Papa from "papaparse";
import type { LocaleCode, TranslationEntry } from "../stores/translations";

export type ImportResult = {
  locales: LocaleCode[];
  entries: TranslationEntry[];
  duplicateKeys: number;
};

const normalize = (v: unknown) =>
  String(v ?? "")
    .replace(/\u00a0/g, " ") // NBSP -> normal space
    .trim();

/**
 * Attempts to decode CSV with intelligent encoding fallback.
 * Handles:
 * - UTF-8 (Google Sheets, modern exports)
 * - UTF-16 (Excel sometimes exports this)
 * - Windows-1250 (Central/Eastern European Excel "ANSI")
 * - Windows-1252 (Western Europe)
 */
function decodeCsv(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // Detect UTF-16 (lots of NUL bytes is a strong indicator)
  let nulCount = 0;
  for (let i = 0; i < Math.min(bytes.length, 2000); i++) {
    if (bytes[i] === 0) nulCount++;
  }

  if (nulCount > 10) {
    // Excel often exports UTF-16LE
    return new TextDecoder("utf-16le").decode(buffer);
  }

  // Try UTF-8 strictly
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    // Try Central European Windows encoding (better for Polish)
    try {
      return new TextDecoder("windows-1250").decode(buffer);
    } catch {
      // Final fallback
      return new TextDecoder("windows-1252").decode(buffer);
    }
  }
}

export function importTranslations(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer;

        let text = decodeCsv(buffer);

        // Remove BOM if present
        text = text.replace(/^\uFEFF/, "");

        Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,

          complete: (result) => {
            const fields = (result.meta.fields ?? []).map(normalize);

            // Find key column (tolerant match)
            const keyHeader =
              fields.find((h) =>
                h.toLowerCase().includes("identifier/key"),
              ) ?? "Identifier/Key: Dev only";

            if (!fields.includes(keyHeader)) {
              reject(
                new Error(
                  `Couldn't find the key column. Expected something like "Identifier/Key: Dev only".`,
                ),
              );
              return;
            }

            const keyIndex = fields.indexOf(keyHeader);

            // Locale headers come after key until first blank header
            const locales: LocaleCode[] = [];
            for (let i = keyIndex + 1; i < fields.length; i++) {
              const h = normalize(fields[i]);
              if (!h) break;
              locales.push(h as LocaleCode);
            }

            const map = new Map<string, TranslationEntry>();
            let duplicates = 0;

            for (const row of result.data) {
              const key = normalize(row[keyHeader]);
              if (!key) continue;

              if (map.has(key)) duplicates++;

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

            resolve({
              locales,
              entries: Array.from(map.values()),
              duplicateKeys: duplicates,
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
