# Vercel 部署检查清单

在部署到 Vercel 之前，请确保完成以下步骤：

## ✅ 必需步骤

### 1. GitHub Personal Access Token
- [ ] 已创建 GitHub Personal Access Token
- [ ] Token 具有 `repo` 权限
- [ ] 已保存 Token（格式：`ghp_xxxxxxxxxxxxxxxxxxxx`）

### 2. Vercel 环境变量
- [ ] 已在 Vercel 项目设置中添加 `GITHUB_TOKEN` 环境变量
- [ ] 环境变量值为你的 GitHub Personal Access Token
- [ ] 已选择所有环境（Production, Preview, Development）

### 3. 代码文件
- [ ] `vercel.json` - Vercel 配置文件
- [ ] `api/member/[phone].js` - 查询会员 API
- [ ] `api/members.js` - 获取所有会员 API
- [ ] `api/member.js` - 添加/更新会员 API
- [ ] `api/member/[id]/benefits.js` - 更新权益状态 API
- [ ] `api/member/[id].js` - 删除会员 API
- [ ] `api/utils/github.js` - GitHub API 工具函数
- [ ] `package.json` - 项目配置（已更新为 Vercel 版本）

### 4. 数据文件
- [ ] `data/members.json` 存在且包含会员数据
- [ ] JSON 格式正确

## 🚀 部署步骤

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Add Vercel serverless functions with GitHub API"
   git push origin main
   ```

2. **在 Vercel 中部署**
   - 访问 [vercel.com](https://vercel.com)
   - 连接你的 GitHub 仓库
   - Vercel 会自动检测并部署

3. **设置环境变量**（如果还没设置）
   - 进入项目 Settings → Environment Variables
   - 添加 `GITHUB_TOKEN`

4. **测试部署**
   - 访问你的 Vercel 域名
   - 测试会员查询功能
   - 测试管理后台功能

## 🔍 测试清单

部署完成后，请测试以下功能：

### 前端功能
- [ ] 主页可以正常访问
- [ ] 手机号搜索功能正常
- [ ] 会员信息显示正确
- [ ] 管理后台可以访问

### API 功能
- [ ] `GET /api/search/[phone]` - 查询会员（新路径）
- [ ] `GET /api/members` - 获取所有会员
- [ ] `POST /api/member` - 添加会员
- [ ] `POST /api/member` - 更新会员
- [ ] `POST /api/benefits/[id]` - 更新权益（新路径）
- [ ] `DELETE /api/member/[id]` - 删除会员

### 数据持久化
- [ ] 添加会员后数据保存到 GitHub
- [ ] 更新会员后数据同步到 GitHub
- [ ] 删除会员后数据从 GitHub 移除
- [ ] GitHub 仓库中可以看到相应的 commit 记录

## ❗ 常见问题

### 1. 部署时报错 "Function Runtimes must have a valid version"
- 这是 `vercel.json` 配置问题
- 解决方案：使用简化的配置，让 Vercel 自动检测运行时
- 确保 `vercel.json` 不包含复杂的 `functions` 配置

### 2. 部署时报错 "Two or more files have conflicting paths"
- 这是动态路由冲突问题
- 原因：`api/member/[phone].js` 和 `api/member/[id]/benefits.js` 路径冲突
- 解决方案：已重新组织 API 结构
  - `api/search/[phone].js` - 查询会员
  - `api/member/[id].js` - 删除会员  
  - `api/benefits/[id].js` - 更新权益
- 前端代码已更新为使用新的 API 路径

### 2. API 返回 500 错误
- 检查 Vercel 函数日志
- 确认 `GITHUB_TOKEN` 环境变量设置正确
- 检查 GitHub API 限制

### 3. 搜索没有结果
- 确认 `data/members.json` 文件存在
- 检查文件格式是否正确
- 查看浏览器控制台错误

### 4. 数据保存失败
- 检查 GitHub Token 权限
- 确认仓库路径正确
- 查看 GitHub API 响应

## 📞 支持

如果遇到问题，可以：
1. 查看 Vercel 函数日志
2. 检查浏览器开发者工具
3. 查看 GitHub 仓库的 commit 历史
4. 测试 GitHub API 连接