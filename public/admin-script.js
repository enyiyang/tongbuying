document.addEventListener('DOMContentLoaded', function() {
    const addMemberBtn = document.getElementById('addMemberBtn');
    const memberModal = document.getElementById('memberModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const memberForm = document.getElementById('memberForm');
    const modalTitle = document.getElementById('modalTitle');
    const membersTableBody = document.getElementById('membersTableBody');

    let currentEditingId = null;

    // 初始化
    loadMembers();

    // 事件监听
    addMemberBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    memberForm.addEventListener('submit', handleFormSubmit);

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === memberModal) {
            closeModal();
        }
    });

    async function loadMembers() {
        try {
            const response = await fetch('/api/members');
            const result = await response.json();
            
            if (result.success) {
                displayMembers(result.data);
            }
        } catch (error) {
            console.error('加载会员列表失败:', error);
            alert('加载会员列表失败');
        }
    }

    function displayMembers(members) {
        membersTableBody.innerHTML = '';
        
        members.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.id}</td>
                <td>${member.nickname}</td>
                <td>${member.phones.join(', ')}</td>
                <td>${formatDate(member.membershipExpiry)}</td>
                <td>¥${member.membershipFee}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="editMember(${member.id})">编辑</button>
                        <button class="btn btn-danger" onclick="deleteMember(${member.id})">删除</button>
                    </div>
                </td>
            `;
            membersTableBody.appendChild(row);
        });
    }

    function openModal(member = null) {
        currentEditingId = member ? member.id : null;
        modalTitle.textContent = member ? '编辑会员' : '添加会员';
        
        // 显示模态框
        memberModal.style.display = 'block';
        
        // 等待模态框完全显示后再初始化内容
        setTimeout(() => {
            if (member) {
                document.getElementById('memberId').value = member.id;
                document.getElementById('memberNickname').value = member.nickname;
                document.getElementById('memberPhones').value = member.phones.join(', ');
                document.getElementById('memberExpiry').value = member.membershipExpiry;
                document.getElementById('memberFee').value = member.membershipFee;
                renderBenefitsEditor(member.benefits);
                renderCoursesEditor(member.courses || []);
            } else {
                memberForm.reset();
                document.getElementById('memberId').value = '';
                renderBenefitsEditor([]);
                renderCoursesEditor([]);
            }
            
            // 确保添加按钮事件正确绑定
            setupAddButton();
            setupAddCourseButton();
        }, 200);
    }

    function closeModal() {
        memberModal.style.display = 'none';
        memberForm.reset();
        currentEditingId = null;
        // 清空权益编辑器
        const benefitsList = document.getElementById('benefitsList');
        if (benefitsList) {
            benefitsList.innerHTML = '';
        }
        // 清空课程编辑器
        const coursesList = document.getElementById('coursesList');
        if (coursesList) {
            coursesList.innerHTML = '';
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const benefits = getBenefitsFromEditor();
        const courses = getCoursesFromEditor();
        
        console.log('准备保存的权益:', benefits);
        console.log('准备保存的课程:', courses);
        
        const memberData = {
            id: currentEditingId,
            nickname: document.getElementById('memberNickname').value.trim(),
            phones: document.getElementById('memberPhones').value.split(',').map(p => p.trim()).filter(p => p),
            membershipExpiry: document.getElementById('memberExpiry').value,
            membershipFee: parseInt(document.getElementById('memberFee').value),
            benefits: benefits,
            courses: courses
        };
        
        console.log('完整的会员数据:', memberData);

        // 验证手机号格式
        for (let phone of memberData.phones) {
            if (!/^1[3-9]\d{9}$/.test(phone)) {
                alert(`手机号格式不正确: ${phone}`);
                return;
            }
        }

        try {
            const response = await fetch('/api/member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            });

            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                closeModal();
                loadMembers();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败，请稍后重试');
        }
    }

    function renderBenefitsEditor(benefits = []) {
        console.log('开始渲染权益编辑器:', benefits);
        const benefitsList = document.getElementById('benefitsList');
        
        if (!benefitsList) {
            console.error('找不到 benefitsList 元素');
            return;
        }
        
        // 清空现有内容
        benefitsList.innerHTML = '';
        
        // 如果没有权益，添加一个空的
        if (!benefits || benefits.length === 0) {
            benefits = [{ text: '', used: false }];
        }
        
        // 为每个权益创建编辑项
        benefits.forEach((benefit, index) => {
            addBenefitRow(benefit.text || '', benefit.used || false);
        });
        
        // 绑定添加按钮
        setupAddButton();
    }
    
    function addBenefitRow(text = '', checked = false) {
        const benefitsList = document.getElementById('benefitsList');
        if (!benefitsList) {
            console.error('找不到 benefitsList');
            return;
        }
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'benefit-editor-item';
        
        // 创建复选框
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = checked;
        checkbox.style.cssText = 'width: 20px; height: 20px; margin-right: 10px;';
        
        // 创建文本输入框
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = text;
        textInput.placeholder = '输入权益描述';
        textInput.style.cssText = 'flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; margin-right: 10px;';
        
        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.textContent = '删除';
        deleteBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;';
        deleteBtn.onclick = function() {
            const benefitsList = document.getElementById('benefitsList');
            if (benefitsList && benefitsList.children.length > 1) {
                rowDiv.remove();
            } else {
                // 如果只剩一个，清空内容
                textInput.value = '';
                checkbox.checked = false;
            }
        };
        
        // 设置容器样式
        rowDiv.style.cssText = 'display: flex; align-items: center; margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;';
        
        // 添加元素到容器
        rowDiv.appendChild(checkbox);
        rowDiv.appendChild(textInput);
        rowDiv.appendChild(deleteBtn);
        
        // 添加到列表
        benefitsList.appendChild(rowDiv);
        console.log('添加了权益行:', text, checked);
        
        return rowDiv;
    }
    
    function setupAddButton() {
        const addBtn = document.getElementById('addBenefitBtn');
        if (addBtn) {
            // 清除之前的事件
            addBtn.onclick = null;
            
            // 添加新事件
            addBtn.onclick = function(e) {
                e.preventDefault();
                console.log('点击添加权益按钮');
                addBenefitRow('', false);
                
                // 聚焦到新添加的输入框
                const benefitsList = document.getElementById('benefitsList');
                if (benefitsList && benefitsList.lastElementChild) {
                    const lastInput = benefitsList.lastElementChild.querySelector('input[type="text"]');
                    if (lastInput) {
                        setTimeout(() => {
                            lastInput.focus();
                            console.log('聚焦到新输入框');
                        }, 50);
                    }
                }
            };
            console.log('设置了添加按钮事件');
        } else {
            console.error('找不到添加权益按钮');
        }
    }

    function getBenefitsFromEditor() {
        const benefitsList = document.getElementById('benefitsList');
        if (!benefitsList) {
            console.log('找不到 benefitsList');
            return [];
        }
        
        const benefits = [];
        const items = benefitsList.querySelectorAll('.benefit-editor-item');
        
        console.log('获取权益，找到项目数:', items.length);
        
        items.forEach((item, index) => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const textInput = item.querySelector('input[type="text"]');
            
            if (textInput && textInput.value.trim()) {
                const benefit = {
                    text: textInput.value.trim(),
                    used: checkbox ? checkbox.checked : false
                };
                benefits.push(benefit);
                console.log(`权益 ${index}:`, benefit);
            }
        });
        
        console.log('最终获取的权益:', benefits);
        return benefits;
    }

    // 课程权益相关函数
    function renderCoursesEditor(courses = []) {
        console.log('开始渲染课程编辑器:', courses);
        const coursesList = document.getElementById('coursesList');
        
        if (!coursesList) {
            console.error('找不到 coursesList 元素');
            return;
        }
        
        // 清空现有内容
        coursesList.innerHTML = '';
        
        // 如果没有课程，添加一个空的
        if (!courses || courses.length === 0) {
            courses = [{ text: '', used: false }];
        }
        
        // 为每个课程创建编辑项
        courses.forEach((course, index) => {
            addCourseRow(course.text || '', course.used || false);
        });
        
        // 绑定添加按钮
        setupAddCourseButton();
    }
    
    function addCourseRow(text = '', checked = false) {
        const coursesList = document.getElementById('coursesList');
        if (!coursesList) {
            console.error('找不到 coursesList');
            return;
        }
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'course-editor-item';
        
        // 创建复选框
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = checked;
        checkbox.style.cssText = 'width: 20px; height: 20px; margin-right: 10px;';
        
        // 创建文本输入框
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = text;
        textInput.placeholder = '输入课程名称';
        textInput.style.cssText = 'flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; margin-right: 10px;';
        
        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.textContent = '删除';
        deleteBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;';
        deleteBtn.onclick = function() {
            const coursesList = document.getElementById('coursesList');
            if (coursesList && coursesList.children.length > 1) {
                rowDiv.remove();
            } else {
                // 如果只剩一个，清空内容
                textInput.value = '';
                checkbox.checked = false;
            }
        };
        
        // 设置容器样式
        rowDiv.style.cssText = 'display: flex; align-items: center; margin-bottom: 10px; padding: 10px; background: #f0f8ff; border-radius: 5px;';
        
        // 添加元素到容器
        rowDiv.appendChild(checkbox);
        rowDiv.appendChild(textInput);
        rowDiv.appendChild(deleteBtn);
        
        // 添加到列表
        coursesList.appendChild(rowDiv);
        console.log('添加了课程行:', text, checked);
        
        return rowDiv;
    }
    
    function setupAddCourseButton() {
        const addBtn = document.getElementById('addCourseBtn');
        if (addBtn) {
            // 清除之前的事件
            addBtn.onclick = null;
            
            // 添加新事件
            addBtn.onclick = function(e) {
                e.preventDefault();
                console.log('点击添加课程按钮');
                addCourseRow('', false);
                
                // 聚焦到新添加的输入框
                const coursesList = document.getElementById('coursesList');
                if (coursesList && coursesList.lastElementChild) {
                    const lastInput = coursesList.lastElementChild.querySelector('input[type="text"]');
                    if (lastInput) {
                        setTimeout(() => {
                            lastInput.focus();
                            console.log('聚焦到新课程输入框');
                        }, 50);
                    }
                }
            };
            console.log('设置了添加课程按钮事件');
        } else {
            console.error('找不到添加课程按钮');
        }
    }

    function getCoursesFromEditor() {
        console.log('=== 开始获取课程数据 ===');
        const coursesList = document.getElementById('coursesList');
        if (!coursesList) {
            console.error('错误：找不到 coursesList 元素');
            return [];
        }
        
        console.log('coursesList 元素存在，子元素数量:', coursesList.children.length);
        console.log('coursesList HTML:', coursesList.innerHTML);
        
        const courses = [];
        const items = coursesList.querySelectorAll('.course-editor-item');
        
        console.log('通过选择器找到的课程项目数:', items.length);
        
        // 如果选择器找不到，尝试直接遍历子元素
        if (items.length === 0) {
            console.log('选择器未找到项目，尝试遍历所有子元素');
            Array.from(coursesList.children).forEach((child, index) => {
                console.log(`子元素 ${index}:`, child.className, child.innerHTML);
                const checkbox = child.querySelector('input[type="checkbox"]');
                const textInput = child.querySelector('input[type="text"]');
                
                if (textInput && textInput.value.trim()) {
                    const course = {
                        text: textInput.value.trim(),
                        used: checkbox ? checkbox.checked : false
                    };
                    courses.push(course);
                    console.log(`从子元素添加课程 ${index}:`, course);
                }
            });
        } else {
            items.forEach((item, index) => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                const textInput = item.querySelector('input[type="text"]');
                
                console.log(`检查课程项目 ${index}:`, {
                    hasTextInput: !!textInput,
                    textValue: textInput ? textInput.value : 'no input',
                    hasCheckbox: !!checkbox,
                    checkboxValue: checkbox ? checkbox.checked : 'no checkbox'
                });
                
                if (textInput && textInput.value.trim()) {
                    const course = {
                        text: textInput.value.trim(),
                        used: checkbox ? checkbox.checked : false
                    };
                    courses.push(course);
                    console.log(`添加课程 ${index}:`, course);
                }
            });
        }
        
        console.log('=== 最终获取的课程数据 ===', courses);
        return courses;
    }

    // 全局函数，供HTML调用
    window.editMember = async function(id) {
        try {
            const response = await fetch('/api/members');
            const result = await response.json();
            
            if (result.success) {
                const member = result.data.find(m => m.id === id);
                if (member) {
                    openModal(member);
                }
            }
        } catch (error) {
            console.error('获取会员信息失败:', error);
            alert('获取会员信息失败');
        }
    };

    window.deleteMember = async function(id) {
        if (!confirm('确定要删除这个会员吗？')) {
            return;
        }

        try {
            const response = await fetch(`/api/member/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                loadMembers();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败，请稍后重试');
        }
    };

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
});