'use client'

import dynamic from 'next/dynamic'

const CVBuilder = dynamic(
  () => import('./cv-builder').then((module) => module.CVBuilder),
  {
    ssr: false,
    loading: () => <main className="min-h-screen bg-background" aria-busy="true" />,
  },
)

export { CVBuilder }
