/**
 * 腾讯混元生图提供商
 * @author Lioe Squieu
 * @created 2025-11-16
 * @skill ai-draw
 */

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export class HunyuanProvider {
  constructor(config) {
    this.config = config
    this.hunyuanClient = null  // 用于 hunyuan-lite (轻量版)
    this.aiartClient = null     // 用于 hunyuan-rapid (极速版/2.0)
  }

  /**
   * 初始化混元客户端 (用于轻量版)
   */
  _initHunyuanClient() {
    if (this.hunyuanClient) return this.hunyuanClient

    try {
      const tencentcloudSdk = require('tencentcloud-sdk-nodejs')
      const HunyuanClient = tencentcloudSdk.hunyuan.v20230901.Client
      
      this.hunyuanClient = new HunyuanClient({
        credential: {
          secretId: this.config.secretId,
          secretKey: this.config.secretKey
        },
        region: this.config.region || '',
        profile: {
          httpProfile: { endpoint: 'hunyuan.tencentcloudapi.com' }
        }
      })
      
      return this.hunyuanClient
    } catch (e) {
      throw new Error('未安装 tencentcloud-sdk-nodejs')
    }
  }

  /**
   * 初始化 AI 艺术客户端 (用于极速版/2.0)
   */
  _initAiartClient() {
    if (this.aiartClient) return this.aiartClient

    try {
      const tencentcloudSdk = require('tencentcloud-sdk-nodejs')
      const AiartClient = tencentcloudSdk.aiart.v20221229.Client
      
      this.aiartClient = new AiartClient({
        credential: {
          secretId: this.config.secretId,
          secretKey: this.config.secretKey
        },
        region: this.config.region || '',
        profile: {
          httpProfile: { endpoint: 'aiart.tencentcloudapi.com' }
        }
      })
      
      return this.aiartClient
    } catch (e) {
      throw new Error('未安装 tencentcloud-sdk-nodejs')
    }
  }

  /**
   * 生成图片（同步）
   * - hunyuan-light (轻量版): 使用 HunyuanClient.TextToImageLite
   * - hunyuan-lite (极速版): 使用 AiartClient.TextToImageLite
   * - hunyuan-rapid (2.0/精简版): 使用 AiartClient.TextToImageRapid
   */
  async generate(params) {
    const { subModel, prompt, resolution, seed, style, logoAdd, rspImgType } = params

    let client, apiMethod

    // 根据子模型选择不同的客户端和 API
    if (subModel === 'hunyuan-light') {
      client = this._initHunyuanClient()
      apiMethod = 'TextToImageLite'
    } else if (subModel === 'hunyuan-lite') {
      client = this._initAiartClient()
      apiMethod = 'TextToImageLite'
    } else if (subModel === 'hunyuan-rapid') {
      client = this._initAiartClient()
      apiMethod = 'TextToImageRapid'
    } else {
      throw new Error(`不支持的子模型: ${subModel}。支持的模型: hunyuan-light, hunyuan-lite, hunyuan-rapid`)
    }

    // 构建请求参数
    const reqData = {
      Prompt: prompt,
      Resolution: resolution || '1024:1024',
      RspImgType: rspImgType || 'url'
    }

    // 可选参数
    if (seed !== undefined && seed !== null && subModel !== 'hunyuan-light') {
      reqData.Seed = seed
    }
    if (style && subModel !== 'hunyuan-lite') {
      reqData.Style = style
    }
    if (logoAdd !== undefined && logoAdd !== null) {
      reqData.LogoAdd = logoAdd
    }
    
    const resp = await client[apiMethod](reqData)

    return {
      imageUrl: resp.ResultImage && resp.ResultImage.startsWith('http') ? resp.ResultImage : null,
      imageBase64: resp.ResultImage && !resp.ResultImage.startsWith('http') ? resp.ResultImage : null,
      requestId: resp.RequestId
    }
  }

  /**
   * 提交异步任务
   */
  async submit(params) {
    const { prompt, resolution, seed, style, logoAdd } = params

    const client = this._initHunyuanClient()

    const reqData = {
      Prompt: prompt,
      Resolution: resolution || '1024:1024',
      Seed: seed || 0,
      Style: style || 'riman',
      LogoAdd: logoAdd || 0
    }

    const resp = await client.SubmitHunyuanImageJob(reqData)
    
    return {
      success: true,
      jobId: resp.JobId,
      requestId: resp.RequestId
    }
  }

  /**
   * 查询异步任务结果
   */
  async query(jobId) {
    const client = this._initHunyuanClient()

    const reqData = { JobId: jobId }

    const resp = await client.QueryHunyuanImageJob(reqData)
    
    // JobStatusCode: 1-处理中, 2-成功, -1-失败
    const statusMap = { 1: 'processing', 2: 'success', '-1': 'failed' }
    
    return {
      status: statusMap[resp.JobStatusCode] || 'unknown',
      imageUrl: resp.ResultImage || null,
      requestId: resp.RequestId
    }
  }
}
