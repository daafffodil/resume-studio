import { useCallback, type ChangeEvent, useState, useEffect, useRef } from 'react'
import type {
  Resume,
  Basics,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  Skills,
  Summary,
} from '../types/resume'
import './ResumeEditor.css'

interface ResumeEditorProps {
  data: Resume
  onChange: (data: Resume) => void
}

export function ResumeEditor({ data, onChange }: ResumeEditorProps) {
  const [activeSection, setActiveSection] = useState<string>('section-basics')
  const observerRef = useRef<IntersectionObserver | null>(null)
  
  useEffect(() => {
    const sections = document.querySelectorAll('.editor-anchor-section')
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3 }
    )
    
    sections.forEach((section) => {
      observerRef.current?.observe(section)
    })
    
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const update = useCallback(
    (partial: Partial<Resume>) => onChange({ ...data, ...partial }),
    [data, onChange]
  )

  const jumpTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id)
  }

  return (
    <div className="resume-editor">
      <h2 className="editor-title">简历信息编辑</h2>
      <p className="editor-subtitle">按模块维护内容，右侧会实时同步预览效果。</p>
      <div className="editor-anchor-nav">
        <button 
          type="button" 
          className={`anchor-chip ${activeSection === 'section-basics' ? 'active' : ''}`}
          onClick={() => jumpTo('section-basics')}
        >
          基本信息
        </button>
        <button 
          type="button" 
          className={`anchor-chip ${activeSection === 'section-education' ? 'active' : ''}`}
          onClick={() => jumpTo('section-education')}
        >
          教育
        </button>
        <button 
          type="button" 
          className={`anchor-chip ${activeSection === 'section-experience' ? 'active' : ''}`}
          onClick={() => jumpTo('section-experience')}
        >
          经历
        </button>
        <button 
          type="button" 
          className={`anchor-chip ${activeSection === 'section-projects' ? 'active' : ''}`}
          onClick={() => jumpTo('section-projects')}
        >
          项目
        </button>
        <button 
          type="button" 
          className={`anchor-chip ${activeSection === 'section-skills' ? 'active' : ''}`}
          onClick={() => jumpTo('section-skills')}
        >
          技能
        </button>
        <button
          type="button"
          className={`anchor-chip ${activeSection === 'section-summary' ? 'active' : ''}`}
          onClick={() => jumpTo('section-summary')}
        >
          自我评价
        </button>
      </div>

      <div id="section-basics" className="editor-anchor-section">
        <BasicsForm
          value={data.basics}
          onChange={(basics) => update({ basics })}
        />
      </div>
      <div id="section-education" className="editor-anchor-section">
        <EducationForm
          value={data.education}
          onChange={(education) => update({ education })}
        />
      </div>
      <div id="section-experience" className="editor-anchor-section">
        <ExperienceForm
          value={data.experience}
          onChange={(experience) => update({ experience })}
        />
      </div>
      <div id="section-projects" className="editor-anchor-section">
        <ProjectsForm
          value={data.projects}
          onChange={(projects) => update({ projects })}
        />
      </div>
      <div id="section-skills" className="editor-anchor-section">
        <SkillsForm
          value={data.skills}
          onChange={(skills) => update({ skills })}
        />
      </div>
      <div id="section-summary" className="editor-anchor-section">
        <SummaryForm
          value={data.summary}
          onChange={(summary) => update({ summary })}
        />
      </div>
    </div>
  )
}

function BasicsForm({
  value,
  onChange,
}: {
  value: Basics
  onChange: (v: Basics) => void
}) {
  const [emailError, setEmailError] = useState('')
  const [avatarError, setAvatarError] = useState('')
  
  const set = (k: keyof Basics, v: string) => {
    onChange({ ...value, [k]: v })
  }

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('邮箱格式不正确')
    } else {
      setEmailError('')
    }
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const MAX_SIZE = 500 * 1024 // 500KB
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setAvatarError(`图片过大（${sizeMB}MB），建议压缩到 500KB 以下`)
      return
    }
    
    setAvatarError('')
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        set('avatar', result)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="form-section">
      <h3>基本信息</h3>
      <label>姓名 <input value={value.name} onChange={(e) => set('name', e.target.value)} /></label>
      <label>英文名 <input value={value.nameEn ?? ''} onChange={(e) => set('nameEn', e.target.value)} placeholder="可选" /></label>
      <label>电话 <input value={value.phone} onChange={(e) => set('phone', e.target.value)} /></label>
      <label>
        邮箱 
        <input 
          type="email" 
          value={value.email} 
          onChange={(e) => {
            set('email', e.target.value)
            validateEmail(e.target.value)
          }}
          className={emailError ? 'input-error' : ''}
        />
        {emailError && <span className="field-error">{emailError}</span>}
      </label>
      <label>目标岗位 <input value={value.targetRole} onChange={(e) => set('targetRole', e.target.value)} /></label>
      <label>
        头像（用于右上角）
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
        {avatarError && <span className="field-error">{avatarError}</span>}
      </label>
      {value.avatar && (
        <div className="avatar-preview">
          <img src={value.avatar} alt="头像预览" />
        </div>
      )}
    </section>
  )
}

function EducationForm({
  value,
  onChange,
}: {
  value: EducationItem[]
  onChange: (v: EducationItem[]) => void
}) {  const validateDateFormat = (date: string) => {
    // 接受 YYYY.MM 或 YYYY-MM 或 YYYY/MM 格式
    const dateRegex = /^\d{4}[.\-/]\d{2}$/
    return !date || dateRegex.test(date)
  }
    const update = (i: number, item: EducationItem) => {
    const next = [...value]
    next[i] = item
    onChange(next)
  }
  const add = () =>
    onChange([...value, { school: '', degree: '', major: '', dateFrom: '', dateTo: '' }])
  const remove = (i: number) => {
    if (confirm('确定删除该教育经历吗？此操作无法撤销。')) {
      onChange(value.filter((_, j) => j !== i))
    }
  }
  return (
    <section className="form-section">
      <h3>教育经历</h3>
      {value.map((edu, i) => (
        <div key={i} className="form-block">
          <label>学校 <input value={edu.school} onChange={(e) => update(i, { ...edu, school: e.target.value })} /></label>
          <label>学历 <input value={edu.degree} onChange={(e) => update(i, { ...edu, degree: e.target.value })} /></label>
          <label>专业 <input value={edu.major} onChange={(e) => update(i, { ...edu, major: e.target.value })} /></label>
          <label>
            开始
            <input 
              value={edu.dateFrom} 
              onChange={(e) => update(i, { ...edu, dateFrom: e.target.value })}
              placeholder="YYYY.MM"
              className={!validateDateFormat(edu.dateFrom) ? 'input-error' : ''}
            />
            {!validateDateFormat(edu.dateFrom) && edu.dateFrom && <span className="field-hint">格式：YYYY.MM</span>}
          </label>
          <label>
            结束
            <input 
              value={edu.dateTo} 
              onChange={(e) => update(i, { ...edu, dateTo: e.target.value })}
              placeholder="YYYY.MM"
              className={!validateDateFormat(edu.dateTo) ? 'input-error' : ''}
            />
            {!validateDateFormat(edu.dateTo) && edu.dateTo && <span className="field-hint">格式：YYYY.MM</span>}
          </label>
          <label>备注 <input value={edu.note ?? ''} onChange={(e) => update(i, { ...edu, note: e.target.value })} placeholder="可选" /></label>
          <button type="button" className="btn-remove" onClick={() => remove(i)}>删除</button>
        </div>
      ))}
      <button type="button" className="btn-add" onClick={add}>+ 添加教育</button>
    </section>
  )
}

function ExperienceForm({
  value,
  onChange,
}: {
  value: ExperienceItem[]
  onChange: (v: ExperienceItem[]) => void
}) {
  const update = (i: number, item: ExperienceItem) => {
    const next = [...value]
    next[i] = item
    onChange(next)
  }
  const setBullets = (i: number, text: string) =>
    update(i, { ...value[i], bullets: text.split('\n').filter(Boolean) })
  const splitBySentence = (i: number) => {
    const raw = value[i].bullets.join('\n') || ''
    if (!raw) return
    // 在句号 / 叹号 / 问号后自动插入换行
    const withBreaks = raw.replace(/([。！？])/g, '$1\n')
    setBullets(i, withBreaks)
  }
  const add = () =>
    onChange([...value, { company: '', title: '', dateFrom: '', dateTo: '', bullets: [] }])
  const remove = (i: number) => {
    if (confirm('确定删除该工作经历吗？此操作无法撤销。')) {
      onChange(value.filter((_, j) => j !== i))
    }
  }
  return (
    <section className="form-section">
      <h3>工作经历</h3>
      {value.map((exp, i) => (
        <div key={i} className="form-block">
          <label>公司 <input value={exp.company} onChange={(e) => update(i, { ...exp, company: e.target.value })} /></label>
          <label>职位 <input value={exp.title} onChange={(e) => update(i, { ...exp, title: e.target.value })} /></label>
          <label>开始 <input value={exp.dateFrom} onChange={(e) => update(i, { ...exp, dateFrom: e.target.value })} /></label>
          <label>结束 <input value={exp.dateTo} onChange={(e) => update(i, { ...exp, dateTo: e.target.value })} /></label>
          <label>
            要点（每行一条，支持 **加粗**）
            <textarea
              value={exp.bullets.join('\n')}
              onChange={(e) => setBullets(i, e.target.value)}
              rows={8}
              className="textarea-bullets"
            />
          </label>
          <div className="inline-actions">
            <button
              type="button"
              className="btn-add-line"
              onClick={() => splitBySentence(i)}
            >
              按句号拆分为多条要点
            </button>
            <span className="inline-hint">
              用法：整段粘贴后点击按钮，会按句号 / 叹号 / 问号拆成多条要点；也可以在中间按回车手动拆分。
            </span>
          </div>
          <button type="button" className="btn-remove" onClick={() => remove(i)}>删除</button>
        </div>
      ))}
      <button type="button" className="btn-add" onClick={add}>+ 添加经历</button>
    </section>
  )
}

function ProjectsForm({
  value,
  onChange,
}: {
  value: ProjectItem[]
  onChange: (v: ProjectItem[]) => void
}) {
  const update = (i: number, item: ProjectItem) => {
    const next = [...value]
    next[i] = item
    onChange(next)
  }
  const add = () =>
    onChange([...value, { name: '', role: '', dateFrom: '', dateTo: '' }])
  const remove = (i: number) => {
    if (confirm('确定删除该项目吗？此操作无法撤销。')) {
      onChange(value.filter((_, j) => j !== i))
    }
  }
  return (
    <section className="form-section">
      <h3>项目经历</h3>
      {value.map((proj, i) => (
        <div key={i} className="form-block">
          <label>项目名 <input value={proj.name} onChange={(e) => update(i, { ...proj, name: e.target.value })} /></label>
          <label>角色 <input value={proj.role} onChange={(e) => update(i, { ...proj, role: e.target.value })} /></label>
          <label>开始 <input value={proj.dateFrom} onChange={(e) => update(i, { ...proj, dateFrom: e.target.value })} /></label>
          <label>结束 <input value={proj.dateTo} onChange={(e) => update(i, { ...proj, dateTo: e.target.value })} /></label>
          <label>描述 <textarea value={proj.description ?? ''} onChange={(e) => update(i, { ...proj, description: e.target.value })} rows={5} placeholder="可选" /></label>
          <button type="button" className="btn-remove" onClick={() => remove(i)}>删除</button>
        </div>
      ))}
      <button type="button" className="btn-add" onClick={add}>+ 添加项目</button>
    </section>
  )
}

function SkillsForm({
  value,
  onChange,
}: {
  value: Skills
  onChange: (v: Skills) => void
}) {
  return (
    <section className="form-section">
      <h3>技能与语言</h3>
      <label>技能 <textarea value={value.skills} onChange={(e) => onChange({ ...value, skills: e.target.value })} rows={4} /></label>
      <label>语言 <input value={value.languages ?? ''} onChange={(e) => onChange({ ...value, languages: e.target.value })} placeholder="可选" /></label>
    </section>
  )
}

function SummaryForm({
  value,
  onChange,
}: {
  value: Summary | undefined
  onChange: (v: Summary | undefined) => void
}) {
  const content = value?.content ?? ''
  return (
    <section className="form-section">
      <h3>自我评价</h3>
      <label>内容 <textarea value={content} onChange={(e) => onChange(e.target.value ? { content: e.target.value } : undefined)} rows={8} placeholder="可选" /></label>
    </section>
  )
}
