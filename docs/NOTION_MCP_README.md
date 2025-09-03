# Notion 中文文章 AI 审阅工具

这是一个使用 AI（OpenAI 或 Google Gemini）自动审阅 Notion 中文文章的工具。它可以检查文章中的语法错误、表达问题，并提供改进建议。

## 功能特点

- 🤖 支持 OpenAI GPT-4 和 Google Gemini 两种 AI 模型
- 📝 自动识别并审阅中文文本内容
- 💬 直接在 Notion 中添加评论和建议
- 🔍 检查句子分割、语法、表达流畅性
- 📊 支持多种 Notion 内容类型（段落、标题、列表等）
- ⚡ 智能跳过已处理的内容块

## 安装依赖

```bash
npm install
```

## 使用方法

### 基本用法

```bash
# 使用 OpenAI (默认)
node index.js openai

# 使用 Google Gemini
node index.js gemini
```

### 配置说明

程序已预配置以下信息：
- Notion 页面 ID: `2270cda410a680219c75d2753af87bcd`
- Notion API Token: 已内置
- OpenAI API Key: 已内置
- Gemini API Key: 已内置

## 审阅内容类型

程序会审阅以下 Notion 内容类型：
- 📄 段落 (paragraph)
- 🏷️ 标题 (heading_1, heading_2, heading_3)
- 📋 项目符号列表 (bulleted_list_item)
- 🔢 编号列表 (numbered_list_item)
- 💬 引用 (quote)

## AI 审阅标准

程序会检查以下方面：
1. **句子分割** - 检查句子是否分割正确
2. **语法准确性** - 检查语法错误
3. **表达流畅性** - 检查表达是否自然
4. **表达优化** - 提供更好的表达方式

## 输出示例

当 AI 发现问题时，会在 Notion 中添加如下格式的评论：

```
🤖 AI 审阅建议:

问题：句子分割不当，应该在此处断句
建议：建议修改为："这是一个很好的例子。它展示了正确的用法。"
```

## 注意事项

1. **API 限制**: 请注意 OpenAI 和 Gemini 的 API 调用限制
2. **网络连接**: 确保网络连接稳定
3. **权限**: 确保 Notion API Token 有足够的权限访问页面
4. **内容安全**: 程序只会处理包含中文字符的内容块

## 错误处理

程序包含完善的错误处理机制：
- API 调用失败时会显示错误信息
- 网络问题时会提示检查连接
- 权限问题时会提示检查 API 密钥

## 开发说明

### 项目结构

```
notion-article-correction-agent/
├── index.js          # 主程序文件
├── package.json      # 项目配置
└── README.md         # 说明文档
```

### 核心类

`ArticleReviewer` 类负责：
- 连接 Notion API
- 调用 AI 服务
- 处理内容块
- 添加评论

### 扩展功能

如需添加新的 AI 提供商，可以：
1. 在 `ArticleReviewer` 类中添加新的审阅方法
2. 在 `reviewText` 方法中添加对应的分支
3. 更新命令行参数验证

## 许可证

MIT License 