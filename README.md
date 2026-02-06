# Translation CMS (Vue 3)

A bespoke, frontend-only translation management tool built with **Vue 3**, **Vite**, **Pinia**, **Tailwind CSS v4**, and **Vitest**.

Inspired by Contentstack-style CMS interfaces, this app provides an intuitive UI for managing translation keys and locale values, with instant JSON generation — no backend required.

---

## ✨ Features

- Accordion-based translation editor
- Inline editing of translation keys
- Per-locale value inputs (e.g. `en-GB`, `en-US`)
- Search across keys *and* values
- Friendly empty state when no search results are found
- Generate formatted JSON output from current translations
- Copy-to-clipboard support with visual feedback
- Fully client-side (ideal for prototyping or internal tools)
- Modern Tailwind v4 setup (Vite plugin, no PostCSS config)

---

## 🧱 Tech Stack

- **Vue 3** (Composition API + `<script setup>`)
- **Vite**
- **Pinia** (state management)
- **Tailwind CSS v4**
- **Vitest** + `@vue/test-utils`
- **TypeScript**

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server
```bash
npm dev
```

Then open:
http://localhost:5173

### 3. 🧪 Running Tests
```bash
npm run test
```

## 📁 Project Structure

src/
├─ components/
│  ├─ TranslationGroup.vue      # Main translations UI
│  ├─ SearchBar.vue             # Search input component
│  └─ JsonOutputPanel.vue       # Generated JSON + copy controls
│
├─ stores/
│  └─ translations.ts           # Pinia store (entries, search, JSON output)
│
├─ App.vue
├─ main.ts
└─ style.css                    # Tailwind v4 entry (@import "tailwindcss")

## 📤 JSON Output Format
```json
{
  "homepage.title": {
    "en-GB": "Welcome",
    "en-US": "Welcome"
  }
}
```