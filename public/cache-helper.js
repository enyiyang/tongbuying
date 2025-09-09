// 前端缓存优化工具
class CacheHelper {
    constructor() {
        this.CACHE_PREFIX = 'tongbuying_';
        this.DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5分钟
        this.MEMBERS_CACHE_TIME = 2 * 60 * 1000; // 2分钟（会员数据更新频率较高）
    }

    // 设置缓存
    setCache(key, data, cacheTime = this.DEFAULT_CACHE_TIME) {
        const cacheData = {
            data: data,
            timestamp: Date.now(),
            expireTime: Date.now() + cacheTime
        };
        
        try {
            localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheData));
            console.log(`缓存已设置: ${key}`);
        } catch (error) {
            console.warn('缓存设置失败:', error);
        }
    }

    // 获取缓存
    getCache(key) {
        try {
            const cached = localStorage.getItem(this.CACHE_PREFIX + key);
            if (!cached) {
                return null;
            }

            const cacheData = JSON.parse(cached);
            
            // 检查是否过期
            if (Date.now() > cacheData.expireTime) {
                this.removeCache(key);
                console.log(`缓存已过期: ${key}`);
                return null;
            }

            console.log(`使用缓存数据: ${key}`);
            return cacheData.data;
        } catch (error) {
            console.warn('缓存读取失败:', error);
            return null;
        }
    }

    // 删除缓存
    removeCache(key) {
        try {
            localStorage.removeItem(this.CACHE_PREFIX + key);
        } catch (error) {
            console.warn('缓存删除失败:', error);
        }
    }

    // 清空所有缓存
    clearAllCache() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.CACHE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('所有缓存已清空');
        } catch (error) {
            console.warn('清空缓存失败:', error);
        }
    }

    // 缓存会员搜索结果
    cacheMemberSearch(phone, memberData) {
        this.setCache(`member_${phone}`, memberData, this.MEMBERS_CACHE_TIME);
    }

    // 获取会员搜索缓存
    getCachedMemberSearch(phone) {
        return this.getCache(`member_${phone}`);
    }

    // 缓存所有会员数据（管理后台用）
    cacheAllMembers(membersData) {
        this.setCache('all_members', membersData, this.MEMBERS_CACHE_TIME);
    }

    // 获取所有会员缓存
    getCachedAllMembers() {
        return this.getCache('all_members');
    }

    // 检查网络状态
    isOnline() {
        return navigator.onLine;
    }

    // 获取缓存统计信息
    getCacheStats() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
        
        let totalSize = 0;
        let validCaches = 0;
        let expiredCaches = 0;

        cacheKeys.forEach(key => {
            try {
                const value = localStorage.getItem(key);
                totalSize += value.length;
                
                const cacheData = JSON.parse(value);
                if (Date.now() > cacheData.expireTime) {
                    expiredCaches++;
                } else {
                    validCaches++;
                }
            } catch (error) {
                // 忽略解析错误
            }
        });

        return {
            totalCaches: cacheKeys.length,
            validCaches,
            expiredCaches,
            totalSize: Math.round(totalSize / 1024) + ' KB'
        };
    }
}

// 创建全局缓存实例
window.cacheHelper = new CacheHelper();

// 网络状态监听
window.addEventListener('online', () => {
    console.log('网络已连接');
});

window.addEventListener('offline', () => {
    console.log('网络已断开，将使用缓存数据');
});

// 页面卸载时清理过期缓存
window.addEventListener('beforeunload', () => {
    const stats = window.cacheHelper.getCacheStats();
    if (stats.expiredCaches > 0) {
        // 清理过期缓存（简单实现）
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(window.cacheHelper.CACHE_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    const cacheData = JSON.parse(cached);
                    if (Date.now() > cacheData.expireTime) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    // 忽略错误
                }
            }
        });
    }
});