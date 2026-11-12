/**
 * Makes sure the Bengali webfont is ready before Phaser renders any Text.
 * The canvas 2D renderer can only use a font once the browser has loaded it.
 */
export async function ensureFontsLoaded(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return
  }

  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('600 24px "Hind Siliguri"', 'সিঁধেল চোর'),
        document.fonts.load('700 24px "Hind Siliguri"', 'শিংকাটা কাহিনি'),
        document.fonts.load('600 24px "Sora"', 'Sora'),
      ]).then(() => document.fonts.ready),
      // Never let a slow font CDN block the game from booting.
      new Promise((resolve) => window.setTimeout(resolve, 2500)),
    ])
  } catch {
    /* Font loading failed — the canvas falls back to a system font. */
  }
}
