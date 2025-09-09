// GitHub API 工具函数

// 从 GitHub 获取会员数据
export async function fetchMembersFromGitHub() {
  const response = await fetch(
    'https://api.github.com/repos/enyiyang/tongbuying/contents/data/members.json',
    {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'tongbuying-app'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API 请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  const jsonData = JSON.parse(content);
  
  return jsonData.members || [];
}

// 从 GitHub 获取会员数据和文件 SHA
export async function fetchMembersWithShaFromGitHub() {
  const response = await fetch(
    'https://api.github.com/repos/enyiyang/tongbuying/contents/data/members.json',
    {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'tongbuying-app'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API 请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  const jsonData = JSON.parse(content);
  
  return {
    members: jsonData.members || [],
    sha: data.sha
  };
}

// 保存会员数据到 GitHub
export async function saveMembersToGitHub(members, sha, commitMessage = 'Update members data') {
  const newData = {
    members: members,
    lastUpdated: new Date().toISOString()
  };
  
  const response = await fetch(
    'https://api.github.com/repos/enyiyang/tongbuying/contents/data/members.json',
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'tongbuying-app'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
        sha: sha
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`保存到 GitHub 失败: ${response.status} ${errorText}`);
  }

  return true;
}