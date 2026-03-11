import { useState, useRef, useEffect, useCallback } from 'react'
import { useReactToPrint } from 'react-to-print'
import type { Resume } from './types/resume'
import resumeData from './data/resume.json'
import { ResumeTemplate } from './components/ResumeTemplate'
import { ResumeEditor } from './pages/ResumeEditor'
import './App.css'

const STORAGE_KEY = 'resume-app-data'
const initialFromStorage = (): Resume | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Resume
  } catch {
    return null
  }
}

const defaultResume = resumeData as Resume

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.type === 'success' && '✓ '}
          {toast.type === 'error' && '✗ '}
          {toast.message}
        </div>
      ))}
    </div>
  )
}

function SaveStatus({ lastSaved }: { lastSaved: number | null }) {
  const [now, setNow] = useState(Date.now())
  
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (lastSaved === null) {
    return <span className="save-status">○ 编辑中</span>
  }
  
  const secondsAgo = Math.floor((now - lastSaved) / 1000)
  if (secondsAgo < 60) {
    return <span className="save-status saved">✓ 已保存</span>
  }
  
  const minutesAgo = Math.floor(secondsAgo / 60)
  return <span className="save-status saved">✓ 已保存 {minutesAgo} 分钟前</span>
}

function App() {
  const [resume, setResume] = useState<Resume>(() => initialFromStorage() ?? defaultResume)
  const [lastSaved, setLastSaved] = useState<number | null>(null)
  const [previewScale, setPreviewScale] = useState(0.66)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(0)
  const printRef = useRef<HTMLDivElement>(null)
  const previewViewportRef = useRef<HTMLDivElement>(null)

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', duration = 2000) => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resume))
        setLastSaved(Date.now())
      } catch (err) {
        addToast('保存失败：浏览器存储满了', 'error')
      }
    }, 500)
    return () => clearTimeout(t)
  }, [resume, addToast])

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `简历_${resume.basics.name}_${resume.basics.nameEn ?? ''}`.trim(),
    pageStyle: `
      @page { size: A4; margin: 0; }
      body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .preview-inner { transform: none !important; transform-origin: top left !important; }
    `,
    onAfterPrint: () => {
      addToast('✓ PDF 已准备就绪', 'success')
    },
  })

  useEffect(() => {
    const updateScale = () => {
      const viewport = previewViewportRef.current
      if (!viewport) return
      // A4 在 96dpi 下大约 794 x 1123 px，用于计算“整页可见”缩放。
      const baseW = 794
      const baseH = 1123
      const header = document.querySelector('.app-header') as HTMLElement | null
      const headerH = header?.offsetHeight ?? 72
      const availableH = window.innerHeight - headerH - 36
      const scaleW = (viewport.clientWidth - 20) / baseW
      const scaleH = (availableH - 20) / baseH
      const next = Math.min(scaleW, scaleH, 1)
      setPreviewScale(Math.max(next, 0.45))
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const handleExportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume.json'
    a.click()
    URL.revokeObjectURL(url)
    setShowMoreMenu(false)
    addToast('✓ JSON 已下载', 'success')
  }, [resume, addToast])

  const handleLoadJson = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const next = JSON.parse(reader.result as string) as Resume
          setResume(next)
          setShowMoreMenu(false)
          addToast('✓ 数据已加载', 'success')
        } catch (err) {
          addToast('✗ 文件格式错误，请检查 JSON 内容', 'error')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [addToast])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-title">
            <h1>Resume Studio</h1>
            <p>结构化编辑、实时预览、一键导出 PDF</p>
          </div>
          <SaveStatus lastSaved={lastSaved} />
          <div className="app-actions">
            <button type="button" className="btn btn-primary" onClick={handlePrint}>
              导出 PDF
            </button>
            <div className="dropdown-wrapper">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                更多 ▼
              </button>
              {showMoreMenu && (
                <div className="dropdown-menu">
                  <button type="button" onClick={handleExportJson}>
                    下载 JSON
                  </button>
                  <button type="button" onClick={handleLoadJson}>
                    从文件加载
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="app-layout">
        <aside className="app-editor">
          <div className="panel-heading">
            <h2>编辑器</h2>
            <p>分区录入，自动保存</p>
          </div>
          <ResumeEditor data={resume} onChange={setResume} />
        </aside>
        <main className="app-preview">
          <div className="panel-heading preview-heading">
            <h2>实时预览</h2>
            <p>A4 · {Math.round(previewScale * 100)}%</p>
          </div>
          <div className="preview-toolbar">
            <span>所见即所得预览</span>
            <span>建议导出前再快速检查一遍排版</span>
          </div>
          <div className="preview-viewport" ref={previewViewportRef}>
            <div
              ref={printRef}
              className="preview-inner"
              style={{ transform: `scale(${previewScale})` }}
            >
              <ResumeTemplate data={resume} />
            </div>
          </div>
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default App
