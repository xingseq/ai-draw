/**
 * AI画画模型配置常量
 * @author Lioe Squieu
 * @created 2025-11-16
 */

// 模型配置
export const modelConfig = {
  'hunyuan-lite': {
    name: '混元极速版',
    hasSizeControl: true,
    hasAspectRatio: true,
    hasFixedResolution: false,
    hasStyle: false  // 极速版不支持风格选择
  },
  'hunyuan-rapid': {
    name: '混元精简版',
    hasSizeControl: true,
    hasAspectRatio: true,
    hasFixedResolution: false,
    hasStyle: true
  },
  'hunyuan-light': {
    name: '混元轻量版',
    hasSizeControl: false,
    hasAspectRatio: false,
    hasFixedResolution: true,
    hasStyle: true
  },
  'hunyuan-async': {
    name: '混元异步版',
    hasSizeControl: false,
    hasAspectRatio: false,
    hasFixedResolution: true,
    hasStyle: true
  }
}

// 宽高比选项
export const aspectRatioOptions = [
  { value: '1:1', label: '1:1 正方形' },
  { value: '4:3', label: '4:3 横向' },
  { value: '3:4', label: '3:4 竖向' },
  { value: '16:9', label: '16:9 宽屏' },
  { value: '9:16', label: '9:16 竖屏' }
]

// 边长选项（完整的官方支持列表）
export const sizeOptions = [
  '160', '200', '225', '256', '512', '520', '608', '768',
  '1024', '1080', '1280', '1600', '1620', '1920', '2048',
  '2400', '2560', '2592', '3440', '3840', '4096'
]

// 固定分辨率选项
export const fixedResolutionOptions = {
  'hunyuan-light': [
    { value: '768:768', label: '1:1 (768×768)' },
    { value: '768:1024', label: '3:4 (768×1024)' },
    { value: '1024:768', label: '4:3 (1024×768)' },
    { value: '1024:1024', label: '1:1 (1024×1024)' },
    { value: '720:1280', label: '9:16 (720×1280)' },
    { value: '1280:720', label: '16:9 (1280×720)' },
    { value: '768:1280', label: '9:16 (768×1280)' },
    { value: '1280:768', label: '16:9 (1280×768)' }
  ],
  'hunyuan-async': [
    { value: '768:768', label: '1:1 (768×768)' },
    { value: '768:1024', label: '3:4 (768×1024)' },
    { value: '1024:768', label: '4:3 (1024×768)' },
    { value: '1024:1024', label: '1:1 (1024×1024)' },
    { value: '720:1280', label: '9:16 (720×1280)' },
    { value: '1280:720', label: '16:9 (1280×720)' },
    { value: '768:1280', label: '9:16 (768×1280)' },
    { value: '1280:768', label: '16:9 (1280×768)' }
  ],
  'hunyuan-lite': [],
  'hunyuan-rapid': []
}

// 风格选项（完整的官方风格列表）
export const styleOptions = {
  'hunyuan-rapid': [
    { value: '', label: '默认' },
    { value: '1', label: '宫崎骏风格' },
    { value: '2', label: '新海诚风格' },
    { value: '3', label: '去旅行风格' },
    { value: '4', label: '水彩风格' },
    { value: '5', label: '像素风格' },
    { value: '6', label: '童话世界风格' },
    { value: '7', label: '奇趣卡通风格' },
    { value: '8', label: '赛博朋克风格' },
    { value: '9', label: '极简风格' },
    { value: '10', label: '复古风格' },
    { value: '11', label: '暗黑系风格' },
    { value: '12', label: '波普风风格' },
    { value: '13', label: '糖果色风格' },
    { value: '14', label: '胶片电影风格' },
    { value: '15', label: '素描风格' },
    { value: '16', label: '水墨画风格' },
    { value: '17', label: '油画风格' },
    { value: '18', label: '粉笔风格' },
    { value: '19', label: '粘土风格' },
    { value: '20', label: '毛毡风格' },
    { value: '21', label: '刺绣风格' },
    { value: '22', label: '彩铅风格' },
    { value: '23', label: '莫奈风格' },
    { value: '24', label: '毕加索风格' },
    { value: '25', label: '穆夏风格' },
    { value: '26', label: '古风二次元风格' },
    { value: '27', label: '都市二次元风格' },
    { value: '28', label: '悬疑风格' },
    { value: '29', label: '校园风格' },
    { value: '30', label: '都市异能风格' }
  ],
  'hunyuan-light': [
    { value: '', label: '默认' },
    { value: '000', label: '（不限定风格）' },
    { value: '101', label: '水墨画' },
    { value: '102', label: '概念艺术' },
    { value: '103', label: '油画1' },
    { value: '118', label: '油画2（梵高）' },
    { value: '104', label: '水彩画' },
    { value: '105', label: '像素画' },
    { value: '106', label: '厚涂风格' },
    { value: '107', label: '插图' },
    { value: '108', label: '剪纸风格' },
    { value: '109', label: '印象派1（莫奈）' },
    { value: '119', label: '印象派2' },
    { value: '110', label: '2.5D' },
    { value: '111', label: '古典肖像画' },
    { value: '112', label: '黑白素描画' },
    { value: '113', label: '赛博朋克' },
    { value: '114', label: '科幻风格' },
    { value: '115', label: '暗黑风格' },
    { value: '116', label: '3D' },
    { value: '117', label: '蒸汽波' },
    { value: '201', label: '日系动漫' },
    { value: '202', label: '怪兽风格' },
    { value: '203', label: '唯美古风' },
    { value: '204', label: '复古动漫' },
    { value: '301', label: '游戏卡通手绘' },
    { value: '401', label: '通用写实风格' }
  ],
  'hunyuan-lite': [
    { value: '', label: '默认' },
    { value: '油画', label: '油画风格' },
    { value: '水彩', label: '水彩风格' },
    { value: '素描', label: '素描风格' },
    { value: '卡通', label: '卡通风格' },
    { value: '写实', label: '写实风格' }
  ],
  'hunyuan-async': [
    { value: '', label: '默认' },
    { value: 'riman', label: '日漫动画' },
    { value: 'shuimo', label: '水墨画' },
    { value: 'monai', label: '莫奈' },
    { value: 'bianping', label: '扁平插画' },
    { value: 'xiangsu', label: '像素插画' },
    { value: 'ertonghuiben', label: '儿童绘本' },
    { value: '3dxuanran', label: '3D 渲染' },
    { value: 'manhua', label: '漫画' },
    { value: 'heibaimanhua', label: '黑白漫画' },
    { value: 'xieshi', label: '写实' },
    { value: 'dongman', label: '动漫' },
    { value: 'bijiasuo', label: '毕加索' },
    { value: 'saibopengke', label: '赛博朋克' },
    { value: 'youhua', label: '油画' },
    { value: 'masaike', label: '马赛克' },
    { value: 'qinghuaci', label: '青花瓷' },
    { value: 'xinnianjianzhi', label: '新年剪纸画' },
    { value: 'xinnianhuayi', label: '新年花艺' }
  ]
}
