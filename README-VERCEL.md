# 会员权益管理系统 - Vercel 部署版本

这是一个基于 Vercel Serverless Functions 和 GitHub API 的会员权益管理系统。

## 部署步骤

### 1. 创建 GitHub Personal Access Token

1. 访问 GitHub Settings → Developer settings → Personal access tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 填写信息：
   - **Note**: `tongbuying-vercel-api`
   - **Expiration**: 选择 "No expiration" 或较长时间
   - **Select scopes**: 勾选 `repo`
4. 生成并保存 token（格式：`ghp_xxxxxxxxxxxxxxxxxxxx`）

### 2. 在 Vercel 中设置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 找到你的项目并进入 Settings
3. 点击 "Environment Variables"
4. 添加环境变量：
   - **Name**: `GITHUB_TOKEN`
   - **Value**: 你的 GitHub Personal Access Token
   - **Environment**: 选择所有环境（Production, Preview, Development）

### 3. 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中连接你的 GitHub 仓库
3. Vercel 会自动部署项目

## 项目结构

```
├── api/                    # Vercel Serverless Functions
│   ├── member/
│   │   ├── [phone].js     # 根据手机号查询会员
│   │   ├── [id].js        # 删除会员
│   │   └── [id]/
│   │       └── benefits.js # 更新权益状态
│   ├── members.js         # 获取所有会员
│   ├── member.js          # 添加/更新会员
│   └── utils/
│       └── github.js      # GitHub API 工具函数
├── public/                # 静态文件
│   ├── index.html        # 会员查询页面
│   ├── admin.html        # 管理后台
│   ├── script.js         # 前端脚本
│   └── ...
├── data/
│   └── members.json      # 会员数据（通过 GitHub API 读写）
├── vercel.json           # Vercel 配置
└── package.json          # 项目配置
```

## API 端点

- `GET /api/member/[phone]` - 根据手机号查询会员
- `GET /api/members` - 获取所有会员（管理后台用）
- `POST /api/member` - 添加或更新会员
- `POST /api/member/[id]/benefits` - 更新权益状态
- `DELETE /api/member/[id]` - 删除会员

## 工作原理

1. **数据存储**: 使用 GitHub 仓库中的 `data/members.json` 文件作为数据库
2. **数据读取**: 通过 GitHub API 读取文件内容
3. **数据写入**: 通过 GitHub API 更新文件内容，每次修改都会创建一个 Git commit
4. **版本控制**: 所有数据变更都有完整的历史记录

## 优势

- ✅ **完全免费**: 利用 GitHub 和 Vercel 的免费额度
- ✅ **数据安全**: 数据存储在 GitHub，有完整的版本控制
- ✅ **自动备份**: 每次修改都有 Git 历史记录
- ✅ **全球 CDN**: Vercel 提供全球加速
- ✅ **自动部署**: 代码推送后自动部署

## 注意事项

1. **API 限制**: GitHub API 每小时限制 5000 次请求
2. **并发处理**: 多人同时修改可能需要处理冲突
3. **文件大小**: 单个文件最大 1MB
4. **延迟**: 相比传统数据库，可能有轻微延迟

## 本地开发

```bash
# 安装 Vercel CLI
npm install -g vercel

# 本地开发
vercel dev
```

## 故障排除

### 1. 搜索没有数据
- 检查 GitHub Token 是否正确设置
- 确认 Token 有 `repo` 权限
- 查看 Vercel 函数日志

### 2. 保存失败
- 检查 GitHub API 限制
- 确认仓库路径正确
- 查看网络连接

### 3. 部署失败
- 检查环境变量设置
- 确认 `vercel.json` 配置正确
- 查看构建日志