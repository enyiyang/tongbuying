# API 路由说明

## 新的 API 路由结构（已修复 Vercel 冲突）

### 查询会员
- **路径**: `GET /api/search/[phone]`
- **说明**: 根据手机号查询会员信息
- **示例**: `/api/search/13812345678`

### 会员管理
- **路径**: `GET /api/members`
- **说明**: 获取所有会员列表（管理后台用）

- **路径**: `POST /api/member`
- **说明**: 添加或更新会员信息
- **请求体**: 
  ```json
  {
    "id": 1, // 可选，有则更新，无则添加
    "nickname": "张三",
    "phones": ["13812345678"],
    "membershipExpiry": "2025-12-31",
    "membershipFee": 1200,
    "benefits": [...],
    "courses": [...]
  }
  ```

- **路径**: `DELETE /api/member/[id]`
- **说明**: 删除指定会员
- **示例**: `/api/member/1`

### 权益管理
- **路径**: `POST /api/benefits/[id]`
- **说明**: 更新指定会员的权益状态
- **示例**: `/api/benefits/1`
- **请求体**:
  ```json
  {
    "benefits": [
      {"text": "权益1", "used": true},
      {"text": "权益2", "used": false}
    ]
  }
  ```

## 前端调用示例

### 查询会员（前端页面）
```javascript
const response = await fetch(`/api/search/${phone}`);
const result = await response.json();
```

### 获取所有会员（管理后台）
```javascript
const response = await fetch('/api/members');
const result = await response.json();
```

### 添加/更新会员（管理后台）
```javascript
const response = await fetch('/api/member', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(memberData)
});
```

### 删除会员（管理后台）
```javascript
const response = await fetch(`/api/member/${id}`, {
  method: 'DELETE'
});
```

### 更新权益状态
```javascript
const response = await fetch(`/api/benefits/${id}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ benefits: updatedBenefits })
});
```

## 路由冲突解决方案

### 原有问题
```
api/member/[phone].js    ❌ 与下面冲突
api/member/[id]/benefits.js
```

### 解决后的结构
```
api/search/[phone].js    ✅ 查询会员
api/member/[id].js       ✅ 删除会员
api/benefits/[id].js     ✅ 更新权益
api/member.js            ✅ 添加/更新会员
api/members.js           ✅ 获取所有会员
```

这样的结构避免了 Vercel 动态路由的冲突问题，每个路径都是唯一的。