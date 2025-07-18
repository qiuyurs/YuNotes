import { DefaultTheme, defineConfig } from 'vitepress';
const docs = require("../../docs.json")
/**
 * Convert feishu-pages's docs.json into VitePress's sidebar config
 * @param docs from `docs.json`
 * @returns
 */
/**
 * 将飞书文档的docs.json转换为VitePress的侧边栏配置
 * @param docs - 来自docs.json的文档结构数据
 * @returns 格式化后的侧边栏配置数组
 */
const convertDocsToSidebars = (docs: any) => {
  const sidebars: DefaultTheme.SidebarItem[] = [];
  
  // 遍历每个文档项
  for (const doc of docs) {
    let sidebar: DefaultTheme.SidebarItem = {
      text: doc.title, // 设置侧边栏项标题
    };
    
    // 处理有子文档的情况
    if (doc.has_child) {
      // 递归处理子文档
      sidebar.items = convertDocsToSidebars(doc.children);
    } else {
      // 设置文档链接
      sidebar.link = '/' + doc.slug;
      
      // 处理文档有子项但has_child为false的情况
      if (doc.children.length > 0) {
        sidebar.items = convertDocsToSidebars(doc.children);
      }
    }
    
    // 默认折叠状态
    sidebar.collapsed = true;
    
    // 添加到侧边栏数组
    sidebars.push(sidebar);
  }

  return sidebars;
};





// https://vitepress.dev/reference/site-config
export default defineConfig({
  // 站点基本配置
  title: "Coze开发指南",
  titleTemplate: 'coze开发教程',
  description: "coze 扣子网站专注于 AI 开发教程...",
  
  // SEO相关配置
  sitemap: {
    hostname: 'https://coze.lyzhan.cn'
  },
  
  // 头部脚本配置
  head: [
    ['script', { charts: 'UTF-8',id:'MXA_COLLECT', src: '//mxana.tacool.com/sdk.js' }],
    ['script', {}, `MXA.init({ id: "c1-ztWxIrlt" })`]
  ],
  
  // Markdown处理配置
  markdown: {
    attrs: {
      disable: true
    }
  },
  
  // Vite构建配置
  vite: {
    build: {
      sourcemap: false
    },
    plugins: [
      {
        name: 'fix-markdown-chars',
        enforce: 'pre',
        transform(code, id) {
          if (id.endsWith('.md')) {
            // 处理特殊字符转义
            code = code.replace(/。/g, '.');
            code = code.replace(/{/g, '&#123;');
            
            // 处理图片链接
            code = code.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
              if (url.includes('图片链接')) {
                return `![${alt}](https://picsum.photos/800/400?random=${Math.random()})`;
              }
              return match;
            });
            
            return code;
          }
          return null;
        }
      }
    ]
  },
  
  // 主题配置
  themeConfig: {
    // 导航栏配置
    nav: [
      { text: '首页', link: '/' },
      { text: '知识星球', link: '/PlrTwePieibawvk2yoqccn3knFf' },
      { text: '联系我们', link: '/HsS7wRKXci4OpBkpRuKcWKjfnif' },
    ],
    // 页脚配置
    footer: {
      message: '<a href="/PlrTwePieibawvk2yoqccn3knFf">知识星球</a> or <a href="/HsS7wRKXci4OpBkpRuKcWKjfnif">联系我们</a>',
      copyright: '<a href="https://beian.miit.gov.cn/">冀ICP备2022023787号-2</a>.'
    },
    
    // 侧边栏配置
    sidebar: convertDocsToSidebars(docs),
    
    // 搜索配置
    search: {
      provider: 'local'
    },
    
    // 文档页脚导航
    docFooter: {
      prev: '上一页',
      next: '下一页'
    }
  },
  
  // 最后更新时间
  lastUpdated: true
})

