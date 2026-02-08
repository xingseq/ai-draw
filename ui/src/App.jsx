/**
 * AI画画子应用 - 主入口
 * @author Lioe Squieu
 * @created 2025-11-16
 */

import { useState, useEffect } from 'react'
import { Palette, Settings, History } from 'lucide-react'
import DrawPage from './components/DrawPage'
import ConfigPage from './components/ConfigPage'
import HistoryPage from './components/HistoryPage'

export default function App() {
  const [tab, setTab] = useState('draw')
  const [darkMode, setDarkMode] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setDarkMode(mediaQuery.matches)
    
    const handler = (e) => setDarkMode(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* 头部 */}
      <header className="sticky top-0 z-50 glass-effect border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg gradient-text">AI画画</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">美术工作室</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl">
            <TabButton 
              active={tab === 'draw'} 
              onClick={() => setTab('draw')}
              icon={<Palette className="w-4 h-4" />}
              label="画画"
            />
            <TabButton 
              active={tab === 'history'} 
              onClick={() => setTab('history')}
              icon={<History className="w-4 h-4" />}
              label="历史"
            />
            <TabButton 
              active={tab === 'config'} 
              onClick={() => setTab('config')}
              icon={<Settings className="w-4 h-4" />}
              label="设置"
            />
          </nav>
        </div>
      </header>
      
      {/* 内容 */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {tab === 'draw' && <DrawPage />}
        {tab === 'history' && <HistoryPage />}
        {tab === 'config' && <ConfigPage />}
      </main>
      
      {/* 底部 */}
      <footer className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        AI画画 - 美术工作室
      </footer>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
        active 
          ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      {icon} {label}
    </button>
  )
}
