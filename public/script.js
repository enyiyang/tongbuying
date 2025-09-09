document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phoneInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultSection = document.getElementById('result');
    const noResultSection = document.getElementById('noResult');

    // 搜索按钮点击事件
    searchBtn.addEventListener('click', searchMember);
    
    // 回车键搜索
    phoneInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMember();
        }
    });

    // 手机号输入格式化
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        e.target.value = value;
    });

    async function searchMember() {
        const phone = phoneInput.value.trim();
        
        if (!phone) {
            alert('请输入手机号');
            return;
        }

        if (!/^1[3-9]\d{9}$/.test(phone)) {
            alert('请输入正确的手机号格式');
            return;
        }

        try {
            searchBtn.textContent = '查询中...';
            searchBtn.disabled = true;

            const response = await fetch(`/api/member/${phone}`);
            const result = await response.json();

            if (result.success) {
                displayMemberInfo(result.data);
            } else {
                showNoResult();
            }
        } catch (error) {
            console.error('查询失败:', error);
            alert('查询失败，请稍后重试');
        } finally {
            searchBtn.textContent = '查询';
            searchBtn.disabled = false;
        }
    }

    function displayMemberInfo(member) {
        // 隐藏无结果提示
        noResultSection.style.display = 'none';
        
        // 填充会员信息
        document.getElementById('nickname').textContent = member.nickname;
        document.getElementById('phones').textContent = member.phones.join(', ');
        
        // 计算剩余天数并显示
        const expiryInfo = getExpiryInfo(member.membershipExpiry);
        document.getElementById('expiry').innerHTML = expiryInfo;
        
        document.getElementById('fee').textContent = member.membershipFee;
        
        // 填充权益列表
        const benefitsContainer = document.getElementById('benefits');
        benefitsContainer.innerHTML = '';
        
        member.benefits.forEach(benefit => {
            const benefitItem = document.createElement('div');
            benefitItem.className = `benefit-item ${benefit.used ? 'used' : 'available'}`;
            benefitItem.innerHTML = `
                <div class="benefit-checkbox ${benefit.used ? 'checked' : 'unchecked'}">
                    ${benefit.used ? '✓' : '○'}
                </div>
                <span class="benefit-text ${benefit.used ? 'used-text' : ''}">${benefit.text}</span>
            `;
            benefitsContainer.appendChild(benefitItem);
        });

        // 填充课程列表
        const coursesContainer = document.getElementById('courses');
        coursesContainer.innerHTML = '';
        
        if (member.courses && member.courses.length > 0) {
            member.courses.forEach(course => {
                const courseItem = document.createElement('div');
                courseItem.className = `benefit-item ${course.used ? 'used' : 'available'}`;
                courseItem.innerHTML = `
                    <div class="benefit-checkbox ${course.used ? 'checked' : 'unchecked'}">
                        ${course.used ? '✓' : '○'}
                    </div>
                    <span class="benefit-text ${course.used ? 'used-text' : ''}">${course.text}</span>
                `;
                coursesContainer.appendChild(courseItem);
            });
        } else {
            coursesContainer.innerHTML = '<div class="no-courses">暂无课程权益</div>';
        }
        
        // 显示结果
        resultSection.style.display = 'block';
    }

    function showNoResult() {
        resultSection.style.display = 'none';
        noResultSection.style.display = 'block';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '/');
    }

    function getExpiryInfo(dateString) {
        const expiryDate = new Date(dateString);
        const today = new Date();
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        const formattedDate = formatDate(dateString);
        
        if (daysDiff > 0) {
            return `${formattedDate} <span style="color: #28a745; font-weight: 600; margin-left: 8px;">(剩余${daysDiff}天)</span>`;
        } else if (daysDiff === 0) {
            return `${formattedDate} <span style="color: #ffc107; font-weight: 600; margin-left: 8px;">(今日到期)</span>`;
        } else {
            return `${formattedDate} <span style="color: #dc3545; font-weight: 600; margin-left: 8px;">(已过期${Math.abs(daysDiff)}天)</span>`;
        }
    }
});