# 简历系统（JSON 驱动）

简历内容以 **结构化 JSON** 存储，通过 React 模板渲染预览；支持表单编辑与一键导出 PDF。后续 AI 改简历时只修改 JSON（如 `src/data/resume.json`），不直接编辑 PDF。

## 流程

1. **简历内容** → 存成 `src/data/resume.json`
2. **预览** → `ResumeTemplate.tsx` 根据 JSON 渲染
3. **编辑** → 表单编辑 basics / education / experience / projects / skills（及自我评价）
4. **导出 PDF** → 从当前 JSON 渲染结果一键导出（浏览器打印 → 另存为 PDF）
5. **AI 改简历** → 只改 `resume.json` 内容，不碰 PDF

## 使用

```bash
cd /Users/chenganan/Desktop/resume-app
npm install
npm run dev

cd /Users/chenganan/Desktop/resume-app
npm run dev
```

打开页面：左侧编辑表单，右侧实时预览；顶部 **导出 PDF**、**下载 JSON**。

## 项目结构

- `src/data/resume.json` — 简历数据（可被 AI 直接修改）
- `src/types/resume.ts` — 简历 TypeScript 类型
- `src/components/ResumeTemplate.tsx` — 简历预览模板
- `src/pages/ResumeEditor.tsx` — 编辑表单页（basics / education / experience / projects / skills）
- `src/App.tsx` — 布局、状态、导出 PDF / 下载 JSON

## 导出 PDF

点击「导出 PDF」会打开浏览器打印对话框，选择「另存为 PDF」即可得到 PDF 文件。内容来自当前 JSON 渲染结果，无需可编辑的 PDF 源文件。