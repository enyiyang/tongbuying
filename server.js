const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data', 'members.json');

// 数据操作函数
async function loadMembers() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData.members || [];
  } catch (error) {
    console.error('加载数据失败:', error.message);
    // 如果文件不存在，返回空数组
    return [];
  }
}

async function saveMembers(members) {
  try {
    // 确保数据目录存在
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    
    // 创建备份
    const backupFile = DATA_FILE + '.backup';
    try {
      await fs.copyFile(DATA_FILE, backupFile);
    } catch (e) {
      // 忽略备份失败（可能是首次创建）
    }
    
    // 保存数据
    const data = {
      members: members,
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('数据保存成功');
    return true;
  } catch (error) {
    console.error('保存数据失败:', error.message);
    return false;
  }
}

// 内存缓存
let membersCache = [];
let cacheLastUpdated = null;

// 初始化数据
async function initializeData() {
  try {
    membersCache = await loadMembers();
    cacheLastUpdated = new Date();
    console.log(`数据初始化完成，加载了 ${membersCache.length} 条会员记录`);
  } catch (error) {
    console.error('数据初始化失败:', error.message);
    membersCache = [];
  }
}

// API路由
// 根据手机号查询会员信息
app.get('/api/member/:phone', async (req, res) => {
  try {
    const phone = req.params.phone;
    const member = membersCache.find(m => m.phones.includes(phone));
    
    if (member) {
      res.json({ success: true, data: member });
    } else {
      res.json({ success: false, message: '未找到该手机号对应的会员信息' });
    }
  } catch (error) {
    console.error('查询会员失败:', error.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取所有会员信息（后台管理用）
app.get('/api/members', async (req, res) => {
  try {
    res.json({ success: true, data: membersCache });
  } catch (error) {
    console.error('获取会员列表失败:', error.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 添加或更新会员信息
app.post('/api/member', async (req, res) => {
  try {
    const { id, nickname, phones, membershipExpiry, membershipFee, benefits, courses } = req.body;
    
    console.log('接收到的会员数据:', { id, nickname, phones, membershipExpiry, membershipFee, benefits, courses });
    
    const now = new Date().toISOString();
    
    if (id) {
      // 更新现有会员
      const index = membersCache.findIndex(m => m.id === id);
      if (index !== -1) {
        membersCache[index] = { 
          id, 
          nickname, 
          phones, 
          membershipExpiry, 
          membershipFee, 
          benefits: benefits || [], 
          courses: courses || [],
          createdAt: membersCache[index].createdAt || now,
          updatedAt: now
        };
        
        // 保存到文件
        const saved = await saveMembers(membersCache);
        if (saved) {
          console.log('更新后的会员数据:', membersCache[index]);
          res.json({ success: true, message: '会员信息更新成功' });
        } else {
          res.status(500).json({ success: false, message: '保存失败' });
        }
      } else {
        res.json({ success: false, message: '会员不存在' });
      }
    } else {
      // 添加新会员
      const newId = Math.max(...membersCache.map(m => m.id), 0) + 1;
      const newMember = { 
        id: newId, 
        nickname, 
        phones, 
        membershipExpiry, 
        membershipFee, 
        benefits: benefits || [], 
        courses: courses || [],
        createdAt: now,
        updatedAt: now
      };
      
      membersCache.push(newMember);
      
      // 保存到文件
      const saved = await saveMembers(membersCache);
      if (saved) {
        console.log('添加的新会员:', newMember);
        res.json({ success: true, message: '会员添加成功', data: newMember });
      } else {
        res.status(500).json({ success: false, message: '保存失败' });
      }
    }
  } catch (error) {
    console.error('操作会员数据失败:', error.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新权益状态
app.post('/api/member/:id/benefits', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { benefits } = req.body;
    
    const member = membersCache.find(m => m.id === id);
    if (member) {
      member.benefits = benefits;
      member.updatedAt = new Date().toISOString();
      
      // 保存到文件
      const saved = await saveMembers(membersCache);
      if (saved) {
        res.json({ success: true, message: '权益状态更新成功' });
      } else {
        res.status(500).json({ success: false, message: '保存失败' });
      }
    } else {
      res.json({ success: false, message: '会员不存在' });
    }
  } catch (error) {
    console.error('更新权益状态失败:', error.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除会员
app.delete('/api/member/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = membersCache.findIndex(m => m.id === id);
    
    if (index !== -1) {
      membersCache.splice(index, 1);
      
      // 保存到文件
      const saved = await saveMembers(membersCache);
      if (saved) {
        res.json({ success: true, message: '会员删除成功' });
      } else {
        res.status(500).json({ success: false, message: '保存失败' });
      }
    } else {
      res.json({ success: false, message: '会员不存在' });
    }
  } catch (error) {
    console.error('删除会员失败:', error.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据
    await initializeData();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`数据文件位置: ${DATA_FILE}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error.message);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务器...');
  try {
    await saveMembers(membersCache);
    console.log('数据已保存');
  } catch (error) {
    console.error('保存数据失败:', error.message);
  }
  process.exit(0);
});

// 启动应用
startServer();