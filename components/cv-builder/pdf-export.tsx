'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useCVStore } from '@/lib/stores/cv-store'
import { ModernTemplate, MinimalTemplate } from './templates'

export function PDFExport() {
  const pdfRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const { template, title, language } = useCVStore()
  const isEn = language === 'en'

  const handleDownload = async () => {
    const element = pdfRef.current
    if (!element || isExporting) return

    setIsExporting(true)
    try {
      await document.fonts.ready
      await Promise.all(
        Array.from(element.querySelectorAll('img')).map((image) =>
          image.decode().catch(() => undefined),
        ),
      )

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ])

      const safeTitle = title.trim().replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80)
      const filename = `${safeTitle || (isEn ? 'My-Resume' : 'سيرتي-الذاتية')}.pdf`
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (_clonedDocument, clonedElement) => {
          clonedElement.style.position = 'static'
          clonedElement.style.left = 'auto'
          clonedElement.style.top = 'auto'
          clonedElement.style.transform = 'none'
          clonedElement.style.margin = '0'
        },
      })

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const continuationTopMarginCssPx = 40
      const continuationTopMarginMm = (continuationTopMarginCssPx * 25.4) / 96
      const continuationTopMarginCanvasPx = continuationTopMarginCssPx * 2
      const pageHeightPx = Math.floor((canvas.width * pageHeight) / pageWidth)

      // Small overflow is more readable when fitted onto one page than split into a nearly empty page.
      if (canvas.height <= pageHeightPx * 1.08) {
        const fitScale = Math.min(1, pageHeightPx / canvas.height)
        const imageWidth = pageWidth * fitScale
        const imageHeight = (canvas.height * pageWidth / canvas.width) * fitScale
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.96),
          'JPEG',
          (pageWidth - imageWidth) / 2,
          0,
          imageWidth,
          imageHeight,
          undefined,
          'FAST',
        )
        pdf.save(filename)
        return
      }

      const rootRect = element.getBoundingClientRect()
      const scale = canvas.width / rootRect.width
      const sectionBounds = Array.from(
        element.querySelectorAll<HTMLElement>('[data-pdf-section]'),
      ).map((node) => {
        const rect = node.getBoundingClientRect()
        return {
          top: Math.max(0, (rect.top - rootRect.top) * scale),
          bottom: (rect.bottom - rootRect.top) * scale,
        }
      })
      const headingBounds = Array.from(element.querySelectorAll<HTMLElement>('h2')).map((heading) => {
        const headingRect = heading.getBoundingClientRect()
        const nextContent = heading.nextElementSibling?.firstElementChild ?? heading.nextElementSibling
        const contentRect = nextContent?.getBoundingClientRect()
        return {
          top: Math.max(0, (headingRect.top - rootRect.top) * scale),
          bottom: ((contentRect?.bottom ?? headingRect.bottom) - rootRect.top) * scale,
        }
      })
      const keepTogether = [...sectionBounds, ...headingBounds]

      let pageTop = 0
      let pageNumber = 0
      while (pageTop < canvas.height) {
        const topMarginPx = pageNumber === 0 ? 0 : continuationTopMarginCanvasPx
        const availablePageHeightPx = pageHeightPx - topMarginPx
        let pageBottom = Math.min(pageTop + availablePageHeightPx, canvas.height)
        if (pageBottom < canvas.height) {
          const crossing = keepTogether
            .filter((item) =>
              item.top > pageTop + 1 &&
              item.top < pageBottom &&
              item.bottom > pageBottom &&
              item.bottom - item.top <= pageHeightPx,
            )
            .sort((a, b) => a.top - b.top)[0]
          if (crossing) {
            pageBottom = Math.floor(crossing.top)
          }
        }

        const sliceHeight = Math.max(1, pageBottom - pageTop)
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = sliceHeight
        const context = pageCanvas.getContext('2d')
        if (!context) throw new Error('Could not prepare the PDF page canvas')
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        context.drawImage(canvas, 0, pageTop, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)

        if (pageNumber > 0) pdf.addPage()
        const renderedHeight = (sliceHeight * pageWidth) / canvas.width
        pdf.addImage(
          pageCanvas.toDataURL('image/jpeg', 0.96),
          'JPEG',
          0,
          pageNumber === 0 ? 0 : continuationTopMarginMm,
          pageWidth,
          renderedHeight,
          undefined,
          'FAST',
        )
        pageTop = pageBottom
        pageNumber += 1
      }

      pdf.save(filename)
    } catch (error) {
      console.error('PDF export error:', error)
      window.alert(
        isEn
          ? 'Could not create the PDF. Please try again.'
          : 'تعذّر إنشاء ملف PDF. حاول مرة أخرى.',
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleDownload}
        className="w-full"
        size="lg"
        disabled={isExporting}
        aria-busy={isExporting}
      >
        {isExporting ? <Loader2 className="h-5 w-5 ml-2 animate-spin" /> : <Download className="h-5 w-5 ml-2" />}
        {isExporting
          ? isEn ? 'جارٍ تجهيز PDF...' : 'جارٍ تجهيز ملف PDF...'
          : isEn ? 'Download PDF' : 'تنزيل PDF'}
      </Button>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {isEn
          ? 'The PDF downloads directly. On iPhone, use Share → Save to Files if prompted.'
          : 'يتم تنزيل PDF مباشرة. على iPhone اختر مشاركة ثم حفظ في الملفات إذا ظهرت المعاينة.'}
      </p>
      <div
        ref={pdfRef}
        className="cv-pdf-document"
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: '210mm',
          minWidth: '210mm',
          maxWidth: '210mm',
          minHeight: '297mm',
          boxSizing: 'border-box',
          background: '#ffffff',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        {template === 'modern' ? <ModernTemplate /> : <MinimalTemplate />}
      </div>
    </>
  )
}
