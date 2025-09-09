import { fetchMembersFromGitHub } from './utils/github.js';

// 获取所有会员信息（后台管理用）
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 从 GitHub 获取数据
    const membersData = await fetchMembersFromGitHub();
    
    res.json({ success: true, data: membersData });
  } catch (error) {
    console.error('获取会员列表失败:', error.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}