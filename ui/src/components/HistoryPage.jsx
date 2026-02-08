/**
 * AI画画历史记录页面
 * @author Lioe Squieu
 * @created 2025-11-16
 */

import { useState, useEffect } from 'react'
import { Loader2, Trash2, Eye, Copy } from 'lucide-react'
import { modelConfig } from './constants/modelConfig'

const API_BASE = '/api'

export default function HistoryPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState('')
  const [availableTags, setAvailableTags] = useState([])
  const [viewingImage, setViewingImage] = useState(null)

  useEffect(() => {
    loadHistory()
  }, [selectedTag])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const url = selectedTag 
        ? `${API_BASE}/history?tag=${encodeURIComponent(selectedTag)}`
        : `${API_BASE}/history`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setRecords(data.records || [])
        
        // 提取所有标签
        const tagsSet = new Set()
        data.records?.forEach(record => {
          if (record.tags) {
            record.tags.split(',').forEach(tag => {
              const trimmedTag = tag.trim()
              if (trimmedTag) tagsSet.add(trimmedTag)
            })
          }
        })
        setAvailableTags(Array.from(tagsSet).sort())
      }
    } catch (error) {
      console.error('加载历史记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这条记录吗？')) return
    
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        loadHistory()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* 标签筛选 */}
      {availableTags.length > 0 && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 dark:text-gray-400">筛选标签：</span>
          <button
            onClick={() => setSelectedTag('')}
            className={`px-3 py-1.5 text-sm rounded-full transition-all ${
              selectedTag === ''
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            全部
          </button>
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                selectedTag === tag
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 记录列表 */}
      {records.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-4xl">🎨</span>
          </div>
          <p className="font-medium text-lg">还没有历史记录</p>
          <p className="text-sm mt-1">生成的图片会自动保存到历史记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map(record => (
            <div
              key={record.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* 图片 */}
              {record.thumbnail_url && (
                <div 
                  className="aspect-square bg-gray-100 dark:bg-gray-700 cursor-pointer"
                  onClick={() => setViewingImage(record.image_url)}
                >
                  <img
                    src={record.thumbnail_url}
                    alt="历史图片"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* 信息 */}
              <div className="p-4">
                <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-2 mb-2">
                  {record.prompt}
                </p>
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <p>模型: {modelConfig[record.model]?.name || record.model}</p>
                  <p>分辨率: {record.resolution?.replace(':', ' × ')}</p>
                  {record.tags && (
                    <div className="flex items-center gap-1 flex-wrap mt-2">
                      {record.tags.split(',').slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(record.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setViewingImage(record.image_url)}
                    className="flex-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    查看
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 图片预览弹窗 */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={() => setViewingImage(null)}
        >
          <img
            src={viewingImage}
            alt="原图"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
