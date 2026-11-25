'use client'

import { useCVStore } from '@/lib/stores/cv-store'
import { useSearchParams } from 'next/navigation'
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react'
import { getCVFontFamily } from './font-family'

function formatDate(dateString?: string, isEn = false) {
  if (!dateString || !dateString.includes('-')) return ''
  const [year, month] = dateString.split('-')
  const monthIndex = Number(month) - 1
  if (!year || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return ''
  const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${(isEn ? monthsEn : monthsAr)[monthIndex]} ${year}`
}

export function MinimalTemplate() {
  const searchParams = useSearchParams()
  const isEn = searchParams.get('lang') === 'en'
  const labels = isEn
    ? {
        fullName: 'Full Name',
        jobTitle: 'Job Title',
        summary: 'Summary',
        experience: 'Work Experience',
        education: 'Education',
        skills: 'Skills',
        languages: 'Languages',
        projects: 'Projects',
        certificates: 'Certificates',
        current: 'Present',
        gpa: 'GPA',
      }
    : {
        fullName: 'الاسم الكامل',
        jobTitle: 'المسمى الوظيفي',
        summary: 'نبذة مختصرة',
        experience: 'الخبرات العملية',
        education: 'التعليم',
        skills: 'المهارات',
        languages: 'اللغات',
        projects: 'المشاريع',
        certificates: 'الشهادات',
        current: 'حتى الآن',
        gpa: 'المعدل التراكمي',
      }
  const { data, themeSettings, photoUrl, sectionOrder } = useCVStore()
  const { personalInfo, experiences, education, skills, languages, projects, certificates } = data

  const imageUrl = photoUrl ? `/api/file?pathname=${encodeURIComponent(photoUrl)}` : null

  const renderSection = (section: string) => {
    switch (section) {
      case 'personalInfo':
        return null // Handled in header
      case 'experiences':
        if (experiences.length === 0) return null
        return (
          <div key="experiences" data-pdf-section className="mb-8">
            <h2 
              className="text-lg font-semibold mb-4 uppercase"
              style={{ color: themeSettings.primaryColor }}
            >
              {labels.experience}
            </h2>
            <div className="space-y-5 border-s-2 ps-4" style={{ borderColor: themeSettings.accentColor }}>
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-sm" style={{ color: themeSettings.primaryColor }}>{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap" dir="ltr">
                      {formatDate(exp.startDate , isEn)} - {exp.current ? labels.current : formatDate(exp.endDate , isEn)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      case 'education':
        if (education.length === 0) return null
        return (
          <div key="education" data-pdf-section className="mb-8">
            <h2 
              className="text-lg font-semibold mb-4 uppercase"
              style={{ color: themeSettings.primaryColor }}
            >
              {labels.education}
            </h2>
            <div className="space-y-5 border-s-2 ps-4" style={{ borderColor: themeSettings.accentColor }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">{edu.degree} {edu.field && `- ${edu.field}`}</h3>
                      <p className="text-sm" style={{ color: themeSettings.primaryColor }}>{edu.institution}</p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap" dir="ltr">
                      {formatDate(edu.startDate , isEn)} - {formatDate(edu.endDate , isEn)}
                    </span>
                  </div>
                  {edu.gpa && (
                    <p className="text-sm text-gray-600 mt-1">{labels.gpa}: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      case 'skills':
        if (skills.length === 0) return null
        return (
          <div key="skills" data-pdf-section className="mb-8">
            <h2 
              className="text-lg font-semibold mb-4 uppercase"
              style={{ color: themeSettings.primaryColor }}
            >
              {labels.skills}
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span 
                  key={skill.id}
                  className="px-3 py-1 text-sm rounded-full text-white"
                  style={{ backgroundColor: themeSettings.primaryColor }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )
      case 'languages':
        if (languages.length === 0) return null
        return (
          <div key="languages" data-pdf-section className="mb-8">
            <h2 
              className="text-lg font-semibold mb-4 uppercase"
              style={{ color: themeSettings.primaryColor }}
            >
              {labels.languages}
            </h2>
            <div className="cv-language-list grid grid-cols-2 gap-4">
              {languages.map((lang) => (
                <div key={lang.id} className="cv-language-row flex items-center justify-between">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-sm text-gray-500">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'projects':
        if (projects.length === 0) return null
        return (
          <div key="projects" data-pdf-section className="mb-8">
            <h2 
              className="text-lg font-semibold mb-4 uppercase"
              style={{ color: themeSettings.primaryColor }}
            >
              {labels.projects}
            </h2>
            <div className="space-y-4 border-s-2 ps-4" style={{ borderColor: themeSettings.accentColor }}>
              {projects.map((proj) => (
                <div key={proj.id}>
                  <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                  {proj.link && (
                    <a 
                      href={proj.link} 
                      className="text-sm underline"
                      style={{ color: themeSettings.accentColor }}
                      dir="ltr"
                    >
                      {proj.link}
                    </a>
                  )}
                  {proj.description && (
                    <p className="text-sm text-gray-600 mt-1">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      case 'certificates':
        if (certificates.length === 0) return null
        return (
          <div key="certificates" data-pdf-section className="mb-8">
            <h2 
              className="text-lg font-semibold mb-4 uppercase"
              style={{ color: themeSettings.primaryColor }}
            >
              {labels.certificates}
            </h2>
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-sm text-gray-500">{cert.issuer}</p>
                  </div>
                  {cert.date && (
                    <span className="text-sm text-gray-400">{formatDate(cert.date , isEn)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      lang={isEn ? 'en' : 'ar'}
      dir={isEn ? 'ltr' : 'rtl'}
      className="cv-template cv-template-minimal w-full min-h-[297mm] bg-white text-gray-900 shadow-lg p-8"
      style={{ 
        fontFamily: getCVFontFamily(themeSettings.fontFamily),
        direction: isEn ? 'ltr' : 'rtl',
        backgroundColor: themeSettings.backgroundColor,
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: themeSettings.primaryColor }}>
        {themeSettings.showPhoto && imageUrl && (
          <div 
            className="w-32 h-32 mx-auto mb-4 overflow-hidden"
            style={{
              borderRadius: themeSettings.photoShape === 'circle' ? '50%' : themeSettings.photoShape === 'rounded' ? '0.5rem' : '0',
              border: `3px solid ${themeSettings.primaryColor}`
            }}
          >
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <h1 
          className="text-3xl font-bold mb-1"
          style={{ color: themeSettings.primaryColor }}
        >
          {personalInfo.fullName || labels.fullName}
        </h1>
        <p className="text-xl text-gray-600 mb-4">{personalInfo.jobTitle || labels.jobTitle}</p>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span dir="ltr">{personalInfo.email}</span>
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span dir="ltr">{personalInfo.phone}</span>
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-4 h-4" />
              <span dir="ltr">{personalInfo.linkedin}</span>
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span dir="ltr">{personalInfo.website}</span>
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div data-pdf-section className="mb-8">
          <h2 
            className="text-lg font-semibold mb-4 uppercase"
            style={{ color: themeSettings.primaryColor }}
          >
            {labels.summary}
          </h2>
          <p className="text-gray-600 leading-relaxed">{personalInfo.summary}</p>
        </div>
      )}

      {/* Content sections in order */}
      {sectionOrder.map(section => renderSection(section))}
    </div>
  )
}
