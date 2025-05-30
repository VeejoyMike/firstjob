# 环境变量配置说明

## 🔥 重要说明

**当前版本是纯前端演示项目，不需要任何环境变量或API密钥！**

这个事件提醒系统使用以下技术栈：
- ✅ **纯前端** Next.js 应用
- ✅ **本地存储** localStorage 保存数据
- ✅ **无需数据库** 或后端服务
- ✅ **内置演示账号** 和测试数据
- ✅ **完全离线可用**

## 📋 内置演示账号

### 管理员账号
- 邮箱: `admin@demo.com` 
- 用户名: `管理员`
- 密码: `123456`
- 权限: 用户管理 + 事件管理

### 普通用户账号
- 邮箱: `zhangsan@demo.com`
- 用户名: `张三`  
- 密码: `123456`
- 权限: 仅事件管理

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问应用
# http://localhost:3000
```

## 🔧 如果将来需要后端集成

如果你想要将这个项目扩展为全栈应用，可以考虑添加以下环境变量：

### 数据库配置
```env
# PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/event_reminder"

# MongoDB  
MONGODB_URI="mongodb://localhost:27017/event_reminder"
```

### 认证配置
```env
# JWT 密钥
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# OAuth (可选)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 邮件服务 (用于邮件提醒)
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587" 
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 推送通知
```env
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
```

### 应用配置
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## 📝 创建 .env.local 文件

如果需要添加环境变量：

1. 复制 `.env.example` 为 `.env.local`
2. 取消注释需要的变量
3. 填入实际的配置值
4. 重启开发服务器

```bash
cp .env.example .env.local
# 编辑 .env.local 文件
npm run dev
```

## 🔒 安全提醒

- ❌ **永远不要**将 `.env.local` 提交到 Git
- ✅ 使用 `.env.example` 作为模板
- ✅ 在生产环境使用强密码和安全密钥
- ✅ 定期轮换 API 密钥和 JWT 密钥

## 📚 相关文档

- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel 环境变量设置](https://vercel.com/docs/concepts/projects/environment-variables)
- [项目部署指南](./README.md#部署)

---

**当前项目状态**: 演示版本，无需配置任何环境变量即可运行！ 🎉 