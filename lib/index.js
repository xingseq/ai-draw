/**
 * AI 绘画 Skill - 多厂商生图服务
 * @author Lioe Squieu
 * @created 2025-11-16
 * @skill ai-draw
 * 
 * 架构设计：
 * 1. 提供商注册表 - 支持动态注册多个厂商（腾讯混元、阿里通义等）
 * 2. 统一调用接口 - generateImage()/submitImageJob()/queryImageJob()
 * 3. 配置传入 - 配置由调用方提供，不依赖主应用
 * 4. 易扩展 - 新增厂商只需实现相同接口并注册
 */

import { HunyuanProvider } from './providers/hunyuanProvider.js'

// 提供商注册表
const PROVIDERS = {
  hunyuan: HunyuanProvider
  // 未来扩展：
  // tongyi: TongyiProvider,
  // stability: StabilityProvider,
  // midjourney: MidjourneyProvider
}

/**
 * 获取提供商实例
 * @param {string} provider - 提供商名称：'hunyuan'|'tongyi'|...
 * @param {object} config - 配置对象 {secretId, secretKey, region, ...}
 */
function getProvider(provider, config) {
  const ProviderClass = PROVIDERS[provider]
  if (!ProviderClass) {
    throw new Error(`不支持的生图提供商: ${provider}，当前支持: ${Object.keys(PROVIDERS).join(', ')}`)
  }
  return new ProviderClass(config)
}

/**
 * 同步生成图片
 * @param {object} params
 * @param {string} params.provider - 提供商：'hunyuan'|'tongyi'|...
 * @param {string} params.subModel - 子模型（如 'hunyuan-rapid'）
 * @param {string} params.prompt - 提示词
 * @param {string} params.resolution - 分辨率
 * @param {number} params.seed - 随机种子
 * @param {string} params.style - 风格
 * @param {number} params.logoAdd - 是否添加Logo
 * @param {string} params.rspImgType - 返回类型：'url'|'base64'
 * @param {object} params.config - 必需，提供商配置 {secretId, secretKey, region}
 * @returns {Promise<{success: boolean, imageUrl?: string, imageBase64?: string, error?: string}>}
 */
export async function generateImage(params) {
  const { provider, config, ...generateParams } = params
  
  if (!config) {
    return {
      success: false,
      error: '缺少配置参数 config',
      provider
    }
  }
  
  try {
    const providerInstance = getProvider(provider, config)
    const result = await providerInstance.generate(generateParams)
    
    return {
      success: true,
      provider,
      ...result
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      provider
    }
  }
}

/**
 * 提交异步生图任务
 * @param {object} params
 * @param {string} params.provider - 提供商
 * @param {object} params.config - 配置
 * @param {string} params.prompt - 提示词
 * @returns {Promise<{success: boolean, jobId?: string, error?: string}>}
 */
export async function submitImageJob(params) {
  const { provider, config, ...jobParams } = params
  
  if (!config) {
    return {
      success: false,
      error: '缺少配置参数 config',
      provider
    }
  }
  
  try {
    const providerInstance = getProvider(provider, config)
    
    if (typeof providerInstance.submit !== 'function') {
      throw new Error(`${provider} 不支持异步任务模式`)
    }
    
    const result = await providerInstance.submit(jobParams)
    
    return {
      success: true,
      provider,
      ...result
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      provider
    }
  }
}

/**
 * 查询异步任务结果
 * @param {object} params
 * @param {string} params.provider - 提供商
 * @param {string} params.jobId - 任务ID
 * @param {object} params.config - 配置
 * @returns {Promise<{success: boolean, status?: string, imageUrl?: string, error?: string}>}
 */
export async function queryImageJob(params) {
  const { provider, jobId, config } = params
  
  if (!config) {
    return {
      success: false,
      error: '缺少配置参数 config',
      provider,
      jobId
    }
  }
  
  try {
    const providerInstance = getProvider(provider, config)
    
    if (typeof providerInstance.query !== 'function') {
      throw new Error(`${provider} 不支持异步任务查询`)
    }
    
    const result = await providerInstance.query(jobId)
    
    return {
      success: true,
      provider,
      jobId,
      ...result
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      provider,
      jobId
    }
  }
}

/**
 * 获取支持的提供商列表
 * @returns {Array<{id: string, name: string, supportsAsync: boolean}>}
 */
export function getSupportedProviders() {
  return Object.keys(PROVIDERS).map(key => ({
    id: key,
    name: key === 'hunyuan' ? '腾讯混元' : key,
    supportsAsync: PROVIDERS[key].prototype.submit !== undefined
  }))
}

/**
 * 获取支持的模型列表
 * @returns {Array<{id: string, name: string, provider: string}>}
 */
export function getSupportedModels() {
  return [
    { id: 'hunyuan-rapid', name: '混元精简版', provider: 'hunyuan', description: '30种风格，速度快' },
    { id: 'hunyuan-light', name: '混元轻量版', provider: 'hunyuan', description: '27种风格，质量高' },
    { id: 'hunyuan-lite', name: '混元极速版', provider: 'hunyuan', description: '5种基础风格，速度最快' },
    { id: 'hunyuan-async', name: '混元异步版', provider: 'hunyuan', description: '18种风格，适合批量生成' }
  ]
}
