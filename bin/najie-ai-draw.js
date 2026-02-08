#!/usr/bin/env node
/**
 * AI画画 Skill - CLI 入口
 * @author Lioe Squieu
 * @created 2025-11-16
 */

import { Command } from 'commander'
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'
import * as aiDrawLib from '../lib/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const program = new Command()

// 配置文件路径（存储在用户数据目录）
const CONFIG_DIR = path.join(os.homedir(), '.najie', 'ai-draw')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

// 确保配置目录存在
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

// 加载配置
function loadConfig() {
  try {
    ensureConfigDir()
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('加载配置失败:', error.message)
  }
  return {
    provider: 'hunyuan',
    secretId: '',
    secretKey: '',
    region: 'ap-guangzhou'
  }
}

// 保存配置
function saveConfig(cfg) {
  try {
    ensureConfigDir()
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('保存配置失败:', error.message)
    return false
  }
}

// 配置存储（从文件加载）
let config = loadConfig()

// 历史记录存储（简单内存存储）
let historyRecords = []
let historyIdCounter = 1

program
  .name('najie-ai-draw')
  .description('AI画画 - 多厂商生图服务')
  .version('0.1.0')

// ========== config 命令 ==========
const configCmd = program.command('config').description('配置管理')

configCmd
  .command('set')
  .description('设置配置')
  .requiredOption('--secretId <secretId>', '腾讯云 SecretId')
  .requiredOption('--secretKey <secretKey>', '腾讯云 SecretKey')
  .option('--region <region>', '地域', 'ap-guangzhou')
  .option('--provider <provider>', '提供商', 'hunyuan')
  .action((options) => {
    const newConfig = {
      provider: options.provider || 'hunyuan',
      secretId: options.secretId,
      secretKey: options.secretKey,
      region: options.region || 'ap-guangzhou'
    }
    if (saveConfig(newConfig)) {
      config = newConfig
      console.log(JSON.stringify({ success: true, message: '配置已保存' }))
    } else {
      console.log(JSON.stringify({ success: false, error: '保存配置失败' }))
    }
  })

configCmd
  .command('show')
  .description('显示当前配置')
  .action(() => {
    const cfg = loadConfig()
    console.log(JSON.stringify({
      success: true,
      config: {
        provider: cfg.provider,
        secretId: cfg.secretId ? cfg.secretId.slice(0, 8) + '***' : '',
        secretKey: cfg.secretKey ? '***' : '',
        region: cfg.region
      }
    }))
  })

// ========== generate 命令 ==========
program
  .command('generate')
  .description('生成图片')
  .requiredOption('--prompt <prompt>', '图片描述提示词')
  .option('--model <model>', '模型选择', 'hunyuan-rapid')
  .option('--resolution <resolution>', '分辨率', '1024:1024')
  .option('--style <style>', '艺术风格编号')
  .option('--output <output>', '输出文件路径')
  .action(async (options) => {
    try {
      // 加载配置
      const cfg = loadConfig()
      if (!cfg.secretId || !cfg.secretKey) {
        console.log(JSON.stringify({ success: false, error: '请先配置 SecretId 和 SecretKey，运行: najie-ai-draw config set --secretId xxx --secretKey xxx' }))
        process.exit(1)
      }
      
      // 调用生图 API
      const result = await aiDrawLib.generateImage({
        provider: cfg.provider,
        config: {
          secretId: cfg.secretId,
          secretKey: cfg.secretKey,
          region: cfg.region
        },
        subModel: options.model,
        prompt: options.prompt,
        resolution: options.resolution,
        style: options.style || ''
      })
      
      if (result.success) {
        // 如果指定了输出路径，保存图片
        let savedPath = null
        if (options.output && result.imageUrl) {
          try {
            const imageData = result.imageUrl.startsWith('http') 
              ? await fetch(result.imageUrl).then(r => r.arrayBuffer()).then(b => Buffer.from(b))
              : Buffer.from(result.imageUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64')
            fs.writeFileSync(options.output, imageData)
            savedPath = options.output
          } catch (saveErr) {
            // 保存失败不影响结果
          }
        }
        console.log(JSON.stringify({
          success: true,
          imageUrl: result.imageUrl,
          imageBase64: result.imageBase64,
          savedPath,
          model: options.model,
          resolution: options.resolution
        }))
      } else {
        console.log(JSON.stringify({ success: false, error: result.error }))
        process.exit(1)
      }
    } catch (error) {
      console.log(JSON.stringify({ success: false, error: error.message }))
      process.exit(1)
    }
  })

// ========== query 命令 ==========
program
  .command('query')
  .description('查询异步任务结果')
  .requiredOption('--jobId <jobId>', '任务ID')
  .action(async (options) => {
    try {
      const cfg = loadConfig()
      if (!cfg.secretId || !cfg.secretKey) {
        console.log(JSON.stringify({ success: false, error: '请先配置 SecretId 和 SecretKey' }))
        process.exit(1)
      }
      
      const result = await aiDrawLib.queryImageJob({
        provider: cfg.provider,
        jobId: options.jobId,
        config: {
          secretId: cfg.secretId,
          secretKey: cfg.secretKey,
          region: cfg.region
        }
      })
      
      console.log(JSON.stringify(result))
      if (!result.success) process.exit(1)
    } catch (error) {
      console.log(JSON.stringify({ success: false, error: error.message }))
      process.exit(1)
    }
  })

// ========== serve 命令 ==========
program
  .command('serve')
  .description('启动 Web UI 服务')
  .option('-p, --port <port>', '服务端口', '5178')
  .action((options) => {
    const port = parseInt(options.port)
    startServer(port)
  })

function startServer(port) {
  const app = express()
  
  app.use(cors())
  app.use(express.json())
  
  // API: 获取配置
  app.get('/api/config', (req, res) => {
    // 重新从文件加载，确保获取最新配置
    config = loadConfig()
    res.json({ success: true, config: { ...config, secretKey: config.secretKey ? '***' : '' } })
  })
  
  // API: 保存配置
  app.post('/api/config', (req, res) => {
    const { provider, secretId, secretKey, region } = req.body
    config = { provider, secretId, secretKey, region }
    const saved = saveConfig(config)
    if (saved) {
      res.json({ success: true })
    } else {
      res.json({ success: false, error: '保存配置到文件失败' })
    }
  })
  
  // API: 测试连接
  app.post('/api/config/test', async (req, res) => {
    try {
      const { provider, secretId, secretKey, region } = req.body
      // 简单测试：尝试获取支持的模型
      const providers = aiDrawLib.getSupportedProviders()
      if (providers.find(p => p.id === provider)) {
        res.json({ success: true })
      } else {
        res.json({ success: false, error: '不支持的提供商' })
      }
    } catch (error) {
      res.json({ success: false, error: error.message })
    }
  })
  
  // API: 生成图片
  app.post('/api/generate', async (req, res) => {
    try {
      const { prompt, model, resolution, style, tags } = req.body
      
      if (!config.secretId || !config.secretKey) {
        return res.json({ success: false, error: '请先配置 SecretId 和 SecretKey' })
      }
      
      const result = await aiDrawLib.generateImage({
        provider: config.provider,
        config: {
          secretId: config.secretId,
          secretKey: config.secretKey,
          region: config.region
        },
        subModel: model,
        prompt,
        resolution,
        style
      })
      
      if (result.success) {
        // 保存到历史记录
        const record = {
          id: historyIdCounter++,
          prompt,
          model,
          resolution,
          style,
          tags,
          image_url: result.imageUrl,
          thumbnail_url: result.imageUrl,
          created_at: new Date().toISOString()
        }
        historyRecords.unshift(record)
        
        res.json({ success: true, imageUrl: result.imageUrl })
      } else {
        res.json({ success: false, error: result.error })
      }
    } catch (error) {
      res.json({ success: false, error: error.message })
    }
  })
  
  // API: 获取历史记录
  app.get('/api/history', (req, res) => {
    const { tag } = req.query
    let records = historyRecords
    
    if (tag) {
      records = records.filter(r => r.tags && r.tags.includes(tag))
    }
    
    res.json({ success: true, records })
  })
  
  // API: 删除历史记录
  app.delete('/api/history/:id', (req, res) => {
    const id = parseInt(req.params.id)
    historyRecords = historyRecords.filter(r => r.id !== id)
    res.json({ success: true })
  })
  
  // 静态文件服务（UI）
  const uiDistPath = path.join(__dirname, '../ui/dist')
  app.use(express.static(uiDistPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(uiDistPath, 'index.html'))
  })
  
  app.listen(port, () => {
    console.log(`🎨 AI画画服务已启动: http://localhost:${port}`)
  })
}

program.parse()
