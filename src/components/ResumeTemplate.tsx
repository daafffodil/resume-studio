import type { Resume } from '../types/resume'
import './ResumeTemplate.css'

interface ResumeTemplateProps {
  data: Resume
}

function renderRichText(text: string) {
  // 支持 **加粗** 语法，主要用于工作要点
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index}>{part.slice(2, -2)}</strong>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export function ResumeTemplate({ data }: ResumeTemplateProps) {
  const { basics, education, experience, projects, skills, summary } = data

  return (
    <div className="resume-template" id="resume-print-root">
      {/* 头部：姓名 + 联系方式 + 目标 */}
      <header className="resume-header">
        <div className="resume-header-main">
          <h1 className="resume-name">
            {basics.name}
            {basics.nameEn ? ` ${basics.nameEn}` : ''}
          </h1>
          <p className="resume-contact">
            {basics.phone} | {basics.email}
          </p>
          <p className="resume-target">目标岗位：{basics.targetRole}</p>
        </div>
        {basics.avatar && (
          <div className="resume-avatar">
            <img src={basics.avatar} alt={`${basics.name} 头像`} />
          </div>
        )}
      </header>

      {/* 教育经历 */}
      <section className="resume-section">
        <h2 className="section-title">教育经历</h2>
        {education.map((edu, i) => (
          <div key={i} className="section-item">
            <div className="item-head">
              <span className="item-main">{edu.school}</span>
              {edu.note && <span className="item-note">{edu.note}</span>}
            </div>
            <div className="item-sub">
              {edu.degree} {edu.major}
            </div>
            <div className="item-date">
              {edu.dateFrom} - {edu.dateTo}
            </div>
          </div>
        ))}
      </section>

      {/* 工作经历：参考格式 - 公司名+下划线，职位与日期同一行（日期右对齐），实心圆点列表 */}
      <section className="resume-section">
        <h2 className="section-title">工作经历</h2>
        {experience.map((exp, i) => (
          <div key={i} className="section-item experience-item">
            <div className="item-head">
              <span className="item-main">{exp.company}</span>
            </div>
            <div className="item-meta">
              <span className="item-sub">{exp.title}</span>
              <span className="item-date">
                {exp.dateFrom} - {exp.dateTo}
              </span>
            </div>
            {exp.bullets.length > 0 && (
              <ul className="item-bullets">
                {exp.bullets.map((b, j) => (
                  <li key={j}>{renderRichText(b)}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* 项目经历 */}
      <section className="resume-section">
        <h2 className="section-title">项目经历</h2>
        {projects.map((proj, i) => (
          <div key={i} className="section-item project-item">
            <div className="item-head">
              <span className="item-main">{proj.name}</span>
              <span className="item-role">
                {proj.role} | {proj.dateFrom} - {proj.dateTo}
              </span>
            </div>
            {proj.description && (
              <p className="item-desc">{proj.description}</p>
            )}
          </div>
        ))}
      </section>

      {/* 技能 / 其他 */}
      <section className="resume-section">
        <h2 className="section-title">其他</h2>
        <p className="skills-line">
          <strong>技能：</strong> {skills.skills}
        </p>
        {skills.languages && (
          <p className="skills-line">
            <strong>语言：</strong> {skills.languages}
          </p>
        )}
      </section>

      {/* 自我评价 */}
      {summary?.content && (
        <section className="resume-section">
          <h2 className="section-title">自我评价</h2>
          <p className="summary-content">{summary.content}</p>
        </section>
      )}
    </div>
  )
}
