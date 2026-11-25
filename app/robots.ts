export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/builder', '/auth'],
    },
    sitemap: 'https://cv.logicstack.tech/sitemap.xml',
  }
}
