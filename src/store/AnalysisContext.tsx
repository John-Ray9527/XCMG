import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CompetitorProfile, KnowledgeEntry } from '../types'

// 应用全局状态：上传 → AI 分析 → 知识就绪（刷新后保留于 localStorage）
export interface AnalysisState {
  documentUploaded: boolean
  analysisCompleted: boolean
  knowledgeReady: boolean
  fileName: string
  profile: CompetitorProfile | null
  entries: KnowledgeEntry[]
}

interface AnalysisContextValue extends AnalysisState {
  uploadDocument: (name: string) => void
  completeAnalysis: (profile: CompetitorProfile, entries: KnowledgeEntry[]) => void
  reset: () => void
}

const STORAGE_KEY = 'kq_analysis_state_v2'

const initialState: AnalysisState = {
  documentUploaded: false,
  analysisCompleted: false,
  knowledgeReady: false,
  fileName: '',
  profile: null,
  entries: [],
}

function loadState(): AnalysisState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw)
    return { ...initialState, ...parsed }
  } catch {
    return initialState
  }
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnalysisState>(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const uploadDocument = (name: string) =>
    setState((s) => ({
      ...s,
      documentUploaded: true,
      analysisCompleted: false,
      knowledgeReady: false,
      fileName: name,
    }))

  const completeAnalysis = (profile: CompetitorProfile, entries: KnowledgeEntry[]) =>
    setState((s) => ({ ...s, analysisCompleted: true, knowledgeReady: true, profile, entries }))

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState(initialState)
  }

  return (
    <AnalysisContext.Provider value={{ ...state, uploadDocument, completeAnalysis, reset }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error('useAnalysis 必须在 AnalysisProvider 内使用')
  return ctx
}
