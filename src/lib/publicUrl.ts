/**
 * Dateien aus `public/` (Vite). Nutzt `import.meta.env.BASE_URL` — z. B. `/FrogyHunter/` auf GitHub Pages.
 * @param path z. B. `assets/ui/foo.png` oder `/assets/ui/foo.png`
 */
export function publicUrl(path: string): string {
  const p = path.replace(/^\/+/, '')
  return `${import.meta.env.BASE_URL}${p}`
}
