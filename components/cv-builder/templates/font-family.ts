const CV_FONT_FAMILIES: Record<string, string> = {
  'Noto Kufi Arabic': 'var(--font-noto-kufi), "Noto Kufi Arabic", sans-serif',
  Tajawal: 'var(--font-tajawal), Tajawal, sans-serif',
  Cairo: 'var(--font-cairo), Cairo, sans-serif',
  Amiri: 'var(--font-amiri), Amiri, serif',
  Almarai: 'var(--font-almarai), Almarai, sans-serif',
}

export function getCVFontFamily(fontName: string) {
  return CV_FONT_FAMILIES[fontName] ?? CV_FONT_FAMILIES['Noto Kufi Arabic']
}
