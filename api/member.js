import { fetchMembersWithShaFromGitHub, saveMembersToGitHub } from './utils/github.js';

// 添加或更新会员信息
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { id, nickname, phones, membershipExpiry, membershipFee, benefits, courses } = req.body;
    
    console.log('接收到的会员数据:', { id, nickname, phones, membershipExpiry, membershipFee, benefits, courses });
    
    // 获取当前数据和文件信息
    const { members: currentMembers, sha } = await fetchMembersWithShaFromGitHub();
    
    const now = new Date().toISOString();
    
    let updatedMembers;
    let message;
    
    if (id) {
      // 更新现有会员
      const index = currentMembers.findIndex(m => m.id === id);
      if (index !== -1) {
        currentMembers[index] = { 
          id, 
          nickname, 
          phones, 
          membershipExpiry, 
          membershipFee, 
          benefits: benefits || [], 
          courses: courses || [],
          createdAt: currentMembers[index].createdAt || now,
          updatedAt: now
        };
        updatedMembers = currentMembers;
        message = '会员信息更新成功';
        console.log('更新后的会员数据:', currentMembers[index]);
      } else {
        return res.json({ success: false, message: '会员不存在' });
      }
    } else {
      // 添加新会员
      const newId = Math.max(...currentMembers.map(m => m.id), 0) + 1;
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
      
      updatedMembers = [...currentMembers, newMember];
      message = '会员添加成功';
      console.log('添加的新会员:', newMember);
    }
    
    // 保存到 GitHub
    await saveMembersToGitHub(updatedMembers, sha, message);
    res.json({ success: true, message });
    
  } catch (error) {
    console.error('操作会员数据失败:', error.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}