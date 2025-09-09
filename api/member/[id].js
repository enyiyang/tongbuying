import { fetchMembersWithShaFromGitHub, saveMembersToGitHub } from '../utils/github.js';

// 删除会员
export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { id } = req.query;
    const memberId = parseInt(id);
    
    // 获取当前数据和文件信息
    const { members: currentMembers, sha } = await fetchMembersWithShaFromGitHub();
    
    const memberIndex = currentMembers.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1) {
      return res.json({ success: false, message: '会员不存在' });
    }
    
    // 删除会员
    const deletedMember = currentMembers[memberIndex];
    currentMembers.splice(memberIndex, 1);
    
    // 保存到 GitHub
    await saveMembersToGitHub(currentMembers, sha, `Delete member ${memberId} (${deletedMember.nickname})`);
    res.json({ success: true, message: '会员删除成功' });
    
  } catch (error) {
    console.error('删除会员失败:', error.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}