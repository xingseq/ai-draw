/**
 * AI画画页面
 * @author Lioe Squieu
 * @created 2025-11-16
 */

import { useState, useEffect } from 'react'
import { Loader2, Download, Sparkles } from 'lucide-react'
import { modelConfig, aspectRatioOptions, sizeOptions, fixedResolutionOptions, styleOptions } from './constants/modelConfig'

const API_BASE = '/api'

export default function DrawPage() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('hunyuan-rapid')
  const [resolution, setResolution] = useState('1024:1024')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [size, setSize] = useState('1024')
  const [style, setStyle] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)

  const currentConfig = modelConfig[model]
  const currentFixedResolutions = fixedResolutionOptions[model] || []
  const currentStyles = styleOptions[model] || []

  // 当模型改变时，重置参数
  useEffect(() => {
    const config = modelConfig[model]
    if (config.hasFixedResolution) {
      const fixedResolutions = fixedResolutionOptions[model]
      if (fixedResolutions && fixedResolutions.length > 0) {
        setResolution(fixedResolutions[0].value)
      }
    } else {
      setAspectRatio('1:1')
      setSize('1024')
    }
    setStyle('')
  }, [model])

  // 计算最终分辨率
  const calculateResolution = () => {
    const config = modelConfig[model]
    
    if (config.hasFixedResolution) {
      return resolution
    }
    
    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number)
    const baseSize = parseInt(size)
    
    if (widthRatio >= heightRatio) {
      const width = baseSize
      const height = Math.round((baseSize * heightRatio) / widthRatio)
      return `${width}:${height}`
    } else {
      const height = baseSize
      const width = Math.round((baseSize * widthRatio) / heightRatio)
      return `${width}:${height}`
    }
  }

  // 生成图片
  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim() || loading) return

    setLoading(true)
    setError(null)
    
    try {
      const finalResolution = calculateResolution()
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model,
          resolution: finalResolution,
          style,
          tags
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setGeneratedImage(data.imageUrl)
      } else {
        setError(data.error || '生成失败')
      }
    } catch (err) {
      setError('生成失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 下载图片
  const handleDownload = async () => {
    if (!generatedImage) return
    
    try {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = `ai-draw-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('下载失败:', err)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧配置面板 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          创作参数
        </h2>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* 提示词 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              描述你想要的画面
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：一只可爱的猫咪坐在窗前看雨..."
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* 模型选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              模型
            </label>
            <select 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="hunyuan-rapid">混元精简版（推荐）</option>
              <option value="hunyuan-light">混元轻量版</option>
              <option value="hunyuan-lite">混元极速版</option>
              <option value="hunyuan-async">混元异步版</option>
            </select>
          </div>

          {/* 分辨率/宽高比 */}
          {currentConfig.hasFixedResolution ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分辨率
              </label>
              <select 
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {currentFixedResolutions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  宽高比
                </label>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  {aspectRatioOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  边长
                </label>
                <select 
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  {sizeOptions.map(option => (
                    <option key={option} value={option}>
                      {option}px
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 风格 */}
          {currentConfig.hasStyle && currentStyles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                艺术风格
              </label>
              <select 
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {currentStyles.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标签（可选）
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例如：动漫, 猫咪, 风景"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 最终分辨率预览 */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            最终分辨率: <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">{calculateResolution().replace(':', ' × ')}</span>
          </div>

          {/* 生成按钮 */}
          <button 
            type="submit" 
            disabled={loading || !prompt.trim()} 
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                生成图片
              </>
            )}
          </button>
        </form>
      </div>

      {/* 右侧结果面板 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 min-h-[500px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            生成结果
          </h2>
          {generatedImage && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
              <p className="font-medium">AI正在为您创作...</p>
              <p className="text-sm mt-1">这可能需要10-30秒</p>
            </div>
          ) : generatedImage ? (
            <img 
              src={generatedImage} 
              alt="AI生成的图片" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
            />
          ) : error ? (
            <div className="text-center text-red-500 dark:text-red-400">
              <p className="font-medium">生成失败</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="font-medium">还没有生成图片</p>
              <p className="text-sm mt-1">填写提示词并点击"生成图片"开始创作</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
