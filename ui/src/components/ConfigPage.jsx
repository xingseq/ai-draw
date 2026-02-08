/**
 * AI画画配置页面 - 大模型参数设置
 * @author Lioe Squieu
 * @created 2025-11-16
 */

import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const API_BASE = '/api'

export default function ConfigPage() {
  const [config, setConfig] = useState({
    provider: 'hunyuan',
    secretId: '',
    secretKey: '',
    region: 'ap-guangzhou'
  })
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState(null)

  // 加载配置
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/config`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.config) {
          setConfig(prev => ({ ...prev, ...data.config }))
        }
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_BASE}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: '配置已保存' })
      } else {
        setMessage({ type: 'error', text: data.error || '保存失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败: ' + error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_BASE}/config/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: '连接测试成功！' })
      } else {
        setMessage({ type: 'error', text: data.error || '连接测试失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '测试失败: ' + error.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          大模型配置
        </h2>

        {/* 提示信息 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* 提供商 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              服务提供商
            </label>
            <select
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="hunyuan">腾讯混元</option>
            </select>
          </div>

          {/* SecretId */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SecretId
            </label>
            <input
              type="text"
              value={config.secretId}
              onChange={(e) => setConfig({ ...config, secretId: e.target.value })}
              placeholder="请输入腾讯云 SecretId"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* SecretKey */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SecretKey
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={config.secretKey}
                onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                placeholder="请输入腾讯云 SecretKey"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              地域
            </label>
            <select
              value={config.region}
              onChange={(e) => setConfig({ ...config, region: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="ap-guangzhou">广州</option>
              <option value="ap-shanghai">上海</option>
              <option value="ap-beijing">北京</option>
            </select>
          </div>

          {/* 说明 */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-sm text-purple-700 dark:text-purple-300">
            <p className="font-medium mb-2">如何获取密钥？</p>
            <ol className="list-decimal list-inside space-y-1 text-purple-600 dark:text-purple-400">
              <li>登录 <a href="https://console.cloud.tencent.com/cam/capi" target="_blank" rel="noopener noreferrer" className="underline">腾讯云控制台</a></li>
              <li>进入「访问管理」-「API密钥管理」</li>
              <li>新建或复制现有密钥</li>
            </ol>
          </div>

          {/* 按钮 */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleTest}
              disabled={testing || !config.secretId || !config.secretKey}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-purple-500 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {testing ? '测试中...' : '测试连接'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !config.secretId || !config.secretKey}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
