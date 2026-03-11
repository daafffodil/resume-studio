/** 简历数据结构 - 仅通过 JSON 编辑，AI 改简历只改此结构 */

export interface Basics {
  name: string
  nameEn?: string
  phone: string
  email: string
  targetRole: string
  avatar?: string // 头像（dataURL 或在线地址）
}

export interface EducationItem {
  school: string
  degree: string
  major: string
  dateFrom: string
  dateTo: string
  note?: string
}

export interface ExperienceItem {
  company: string
  title: string
  dateFrom: string
  dateTo: string
  bullets: string[]
}

export interface ProjectItem {
  name: string
  role: string
  dateFrom: string
  dateTo: string
  description?: string
}

export interface Skills {
  skills: string
  languages?: string
}

export interface Summary {
  content: string
}

export interface Resume {
  basics: Basics
  education: EducationItem[]
  experience: ExperienceItem[]
  projects: ProjectItem[]
  skills: Skills
  summary?: Summary
}
