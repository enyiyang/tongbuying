#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'members.json');

class DataManager {
  async loadData() {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('加载数据失败:', error.message);
      return null;
    }
  }

  async saveData(data) {
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
      console.log('数据保存成功');
      return true;
    } catch (error) {
      console.error('保存数据失败:', error.message);
      return false;
    }
  }

  async backup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = DATA_FILE.replace('.json', `_backup_${timestamp}.json`);
      await fs.copyFile(DATA_FILE, backupFile);
      console.log(`备份创建成功: ${backupFile}`);
      return backupFile;
    } catch (error) {
      console.error('创建备份失败:', error.message);
      return null;
    }
  }

  async restore(backupFile) {
    try {
      await fs.copyFile(backupFile, DATA_FILE);
      console.log('数据恢复成功');
      return true;
    } catch (error) {
      console.error('恢复数据失败:', error.message);
      return false;
    }
  }

  async stats() {
    const data = await this.loadData();
    if (!data) return;

    const members = data.members || [];
    console.log('\n=== 数据统计 ===');
    console.log(`总会员数: ${members.length}`);
    console.log(`最后更新: ${data.lastUpdated || '未知'}`);
    
    const activeMembersCount = members.filter(m => {
      const expiry = new Date(m.membershipExpiry);
      return expiry > new Date();
    }).length;
    
    console.log(`活跃会员: ${activeMembersCount}`);
    console.log(`过期会员: ${members.length - activeMembersCount}`);
  }

  async validate() {
    const data = await this.loadData();
    if (!data) return false;

    const members = data.members || [];
    let isValid = true;
    
    console.log('\n=== 数据验证 ===');
    
    members.forEach((member, index) => {
      if (!member.id || !member.nickname || !member.phones) {
        console.error(`会员 ${index + 1} 缺少必要字段`);
        isValid = false;
      }
      
      if (!Array.isArray(member.phones)) {
        console.error(`会员 ${member.nickname} 的手机号格式错误`);
        isValid = false;
      }
      
      if (!Array.isArray(member.benefits)) {
        console.error(`会员 ${member.nickname} 的权益格式错误`);
        isValid = false;
      }
      
      if (!Array.isArray(member.courses)) {
        console.error(`会员 ${member.nickname} 的课程格式错误`);
        isValid = false;
      }
    });
    
    if (isValid) {
      console.log('数据验证通过 ✓');
    } else {
      console.log('数据验证失败 ✗');
    }
    
    return isValid;
  }
}

// 命令行接口
async function main() {
  const manager = new DataManager();
  const command = process.argv[2];
  
  switch (command) {
    case 'backup':
      await manager.backup();
      break;
      
    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.error('请指定备份文件路径');
        process.exit(1);
      }
      await manager.restore(backupFile);
      break;
      
    case 'stats':
      await manager.stats();
      break;
      
    case 'validate':
      await manager.validate();
      break;
      
    default:
      console.log(`
数据管理工具

用法:
  node scripts/data-manager.js <command>

命令:
  backup          创建数据备份
  restore <file>  从备份恢复数据
  stats           显示数据统计
  validate        验证数据完整性

示例:
  node scripts/data-manager.js backup
  node scripts/data-manager.js restore data/members_backup_2025-09-09.json
  node scripts/data-manager.js stats
  node scripts/data-manager.js validate
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DataManager;