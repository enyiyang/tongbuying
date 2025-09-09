import { fetchMembersWithShaFromGitHub, saveMembersToGitHub } from '../utils/github.js';

// 更新会员权益状态
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { id } = req.query;
    const { benefits } = req.body;
    
    const memberId = parseInt(id);
    
    // 获取当前数据和文件信息
    const { members: currentMembers, sha } = await fetchMembersWithShaFromGitHub();
    
    const memberIndex = currentMembers.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1) {
      return res.json({ success: false, message: '会员不存在' });
    }
    
    // 更新权益状态
    currentMembers[memberIndex].benefits = benefits;
    currentMembers[memberIndex].updatedAt = new Date().toISOString();
    
    // 保存到 GitHub
    await saveMembersToGitHub(currentMembers, sha, `Update benefits for member ${memberId}`);
    res.json({ success: true, message: '权益状态更新成功' });
    
  } catch (error) {
    console.error('更新权益状态失败:', error.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}