import { fetchMembersFromGitHub } from '../utils/github.js';

// 根据手机号查询会员信息
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({ success: false, message: '手机号不能为空' });
    }

    // 从 GitHub 获取数据
    const membersData = await fetchMembersFromGitHub();
    
    // 查找匹配的会员
    const member = membersData.find(m => m.phones.includes(phone));
    
    if (member) {
      res.json({ success: true, data: member });
    } else {
      res.json({ success: false, message: '未找到该手机号对应的会员信息' });
    }
  } catch (error) {
    console.error('查询会员失败:', error.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}