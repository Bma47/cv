'use client'

import { useCVStore } from '@/lib/stores/cv-store'
import { ModernTemplate, MinimalTemplate } from './templates'

type CVPreviewProps = {
  printMode?: boolean
}

export function CVPreview({ printMode = false }: CVPreviewProps) {
  const { template } = useCVStore()

  if (printMode) {
    return (
      <div
        style={{
          width: '210mm',
          minWidth: '210mm',
          maxWidth: '210mm',
          minHeight: '297mm',
          boxSizing: 'border-box',
          background: '#ffffff',
          overflow: 'visible',
        }}
      >
        {template === 'modern' ? <ModernTemplate /> : <MinimalTemplate />}
      </div>
    )
  }

  return (
    <div className="cv-header">
      {template === 'modern' ? <ModernTemplate /> : <MinimalTemplate />}
    </div>
  )
}
