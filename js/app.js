/**
 * 咖啡店员工排班系统 - 主应用文件
 * 负责应用初始化、事件绑定和模块协调
 */

const App = {
    /**
     * 初始化应用
     */
    init() {
        console.log('初始化咖啡店排班系统...');
        console.log('当前协议:', window.location.protocol);
        
        // 检查并同步数据
        this.checkAndSyncData();
        
        // 初始化数据
        this.initializeData();
        
        // 绑定全局事件
        this.bindGlobalEvents();
        
        // 确保DOM完全加载后再渲染
        setTimeout(() => {
            // 初始化各模块
            try {
                StoreManager.renderList();
                EmployeeManager.renderList();
                EmployeeManager.renderQuickList();
                ShiftManager.renderList();
                ScheduleManager.init();
                
                console.log('系统初始化完成');
            } catch (error) {
                console.error('初始化错误:', error);
                // 显示初始化按钮
                const initBtn = document.getElementById('initDataBtn');
                if (initBtn) {
                    initBtn.style.display = 'inline-block';
                }
            }
        }, 100);
    },

    /**
     * 检查并同步数据（确保file://和http://显示一致）
     */
    checkAndSyncData() {
        // 检查是否有备份数据
        const backupKey = 'coffee_shop_backup_data';
        const backup = localStorage.getItem(backupKey);
        
        if (backup) {
            try {
                const backupData = JSON.parse(backup);
                const currentData = Storage.exportData();
                
                // 比较数据，使用最新的数据
                const backupTime = new Date(backupData.exportDate || 0);
                const currentTime = new Date(currentData.exportDate || 0);
                
                if (backupTime > currentTime) {
                    console.log('发现更新的备份数据，正在同步...');
                    Storage.importData(backupData);
                } else if (currentTime > backupTime) {
                    console.log('当前数据更新，更新备份...');
                    localStorage.setItem(backupKey, JSON.stringify(currentData));
                }
            } catch (error) {
                console.error('同步数据失败:', error);
            }
        }
        
        // 定期保存备份
        setInterval(() => {
            const currentData = Storage.exportData();
            localStorage.setItem('coffee_shop_backup_data', JSON.stringify(currentData));
        }, 5000); // 每5秒备份一次
    },

    /**
     * 初始化数据（首次使用时创建默认数据）
     */
    initializeData() {
        // 检查是否需要初始化或重新初始化
        const needsInit = !Storage.isInitialized();
        const hasData = Storage.getStores().length > 0 ||
                       Storage.getEmployees().length > 0 ||
                       Storage.getShifts().length > 0;
        
        // 强制初始化：如果没有数据，总是创建默认数据
        if (!hasData) {
            console.log('首次使用或数据为空，创建默认数据...');
            
            // 创建默认分店
            const defaultStores = [
                { id: 'store1', name: '联庄', address: '', phone: '' },
                { id: 'store2', name: '余杭', address: '', phone: '' },
                { id: 'store3', name: '开元', address: '', phone: '' },
                { id: 'store4', name: '浣纱', address: '', phone: '' },
                { id: 'store5', name: '山泽里', address: '', phone: '' },
                { id: 'store6', name: '泰隆', address: '', phone: '' },
                { id: 'store7', name: '城西', address: '', phone: '' },
                { id: 'store8', name: '工厂', address: '', phone: '' },
                { id: 'store9', name: '星光', address: '', phone: '' }
            ];
            Storage.saveStores(defaultStores);
            
            // 创建默认班次
            const defaultShifts = [
                { id: Storage.generateId(), name: '早班', startTime: '07:00', endTime: '14:00', color: '#3498db', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '中班', startTime: '14:00', endTime: '21:00', color: '#2ecc71', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '晚班', startTime: '21:00', endTime: '23:00', color: '#9b59b6', createdAt: new Date().toISOString() }
            ];
            Storage.saveShifts(defaultShifts);
            
            // 创建默认员工
            const defaultEmployees = [
                { id: Storage.generateId(), name: '欣怡', position: '咖啡师', phone: '', email: '', color: '#e74c3c', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '小酒', position: '咖啡师', phone: '', email: '', color: '#3498db', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '等等', position: '咖啡师', phone: '', email: '', color: '#2ecc71', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '怡彤', position: '咖啡师', phone: '', email: '', color: '#9b59b6', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '小周', position: '咖啡师', phone: '', email: '', color: '#c0392b', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '梦婷', position: '咖啡师', phone: '', email: '', color: '#f39c12', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '小雷', position: '咖啡师', phone: '', email: '', color: '#8e44ad', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '丹尼', position: '咖啡师', phone: '', email: '', color: '#1abc9c', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '小辞', position: '咖啡师', phone: '', email: '', color: '#d35400', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '一筒', position: '咖啡师', phone: '', email: '', color: '#16a085', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '阿乐', position: '咖啡师', phone: '', email: '', color: '#7f8c8d', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '梁瑞', position: '咖啡师', phone: '', email: '', color: '#e67e22', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '爱玲', position: '咖啡师', phone: '', email: '', color: '#27ae60', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '小宇', position: '咖啡师', phone: '', email: '', color: '#34495e', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '塔塔', position: '咖啡师', phone: '', email: '', color: '#8B4513', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '立思', position: '咖啡师', phone: '', email: '', color: '#2c3e50', createdAt: new Date().toISOString() },
                { id: Storage.generateId(), name: '曲曲', position: '咖啡师', phone: '', email: '', color: '#e84393', createdAt: new Date().toISOString() }
            ];
            Storage.saveEmployees(defaultEmployees);
            
            // 标记为已初始化
            Storage.markAsInitialized();
            
            console.log('默认数据创建完成');
            console.log('已创建 ' + defaultStores.length + ' 个分店');
            console.log('已创建 ' + defaultShifts.length + ' 个班次');
            console.log('已创建 ' + defaultEmployees.length + ' 个员工');
        } else {
            console.log('使用现有数据');
            console.log('当前有 ' + Storage.getStores().length + ' 个分店');
            console.log('当前有 ' + Storage.getEmployees().length + ' 个员工');
            console.log('当前有 ' + Storage.getShifts().length + ' 个班次');
        }
    },

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 导航标签切换
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 添加员工按钮
        document.getElementById('addEmployeeBtn').addEventListener('click', () => {
            EmployeeManager.openAddModal();
        });

        // 添加班次按钮
        document.getElementById('addShiftBtn').addEventListener('click', () => {
            ShiftManager.openAddModal();
        });

        // 添加分店按钮
        document.getElementById('addStoreBtn').addEventListener('click', () => {
            StoreManager.openAddModal();
        });

        // 分店表单提交
        document.getElementById('storeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                id: document.getElementById('storeId').value,
                name: document.getElementById('storeName').value,
                address: document.getElementById('storeAddress').value,
                phone: document.getElementById('storePhone').value
            };
            
            const submitData = new FormData();
            Object.keys(data).forEach(key => {
                submitData.append(key, data[key]);
            });
            
            if (StoreManager.save(submitData)) {
                alert('保存成功');
                ScheduleManager.renderStoreSelector();
            }
        });

        // 员工表单提交
        document.getElementById('employeeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                id: document.getElementById('employeeId').value,
                name: document.getElementById('employeeName').value,
                position: document.getElementById('employeePosition').value,
                phone: document.getElementById('employeePhone').value,
                email: document.getElementById('employeeEmail').value,
                color: document.getElementById('employeeColor').value
            };
            
            // 创建 FormData 对象
            const submitData = new FormData();
            Object.keys(data).forEach(key => {
                submitData.append(key, data[key]);
            });
            
            if (EmployeeManager.save(submitData)) {
                alert('保存成功');
            }
        });

        // 班次表单提交
        document.getElementById('shiftForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                id: document.getElementById('shiftId').value,
                name: document.getElementById('shiftName').value,
                startTime: document.getElementById('shiftStartTime').value,
                endTime: document.getElementById('shiftEndTime').value,
                color: document.getElementById('shiftColor').value
            };
            
            // 创建 FormData 对象
            const submitData = new FormData();
            Object.keys(data).forEach(key => {
                submitData.append(key, data[key]);
            });
            
            if (ShiftManager.save(submitData)) {
                alert('保存成功');
            }
        });

        // 模态框关闭按钮
        document.querySelectorAll('.close-btn, [data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.close || e.target.closest('.modal').id;
                this.closeModal(modalId);
            });
        });

        // 点击模态框背景关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // 导出数据
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // 导入数据
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        // 导入文件选择
        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // 生成排班表按钮
        document.getElementById('generateScheduleBtn').addEventListener('click', async () => {
            await ScheduleImageGenerator.generateScheduleImage();
        });

        // 重置数据按钮（侧边栏）
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetAllData();
            });
        }
        
        // 重置数据按钮（主页）
        const resetDataBtn = document.getElementById('resetDataBtn');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                this.resetAllData();
            });
        }

        // 初始化数据按钮（仅在出错时显示）
        const initBtn = document.getElementById('initDataBtn');
        if (initBtn) {
            initBtn.addEventListener('click', () => {
                console.log('手动初始化数据...');
                this.initializeData();
                StoreManager.renderList();
                EmployeeManager.renderList();
                EmployeeManager.renderQuickList();
                ShiftManager.renderList();
                ScheduleManager.init();
                initBtn.style.display = 'none';
                alert('数据初始化完成！');
            });
        }
    },

    /**
     * 重置所有数据到默认状态
     */
    resetAllData() {
        if (confirm('确定要重置所有数据吗？这将清除所有员工、班次、排班和分店信息，恢复到默认状态。')) {
            // 清除所有数据
            Storage.clearAll();
            
            // 清除备份数据
            localStorage.removeItem('coffee_shop_backup_data');
            
            // 重新初始化
            this.initializeData();
            
            // 重新渲染
            StoreManager.renderList();
            EmployeeManager.renderList();
            EmployeeManager.renderQuickList();
            ShiftManager.renderList();
            ScheduleManager.renderCalendar();
            
            alert('数据已重置到默认状态');
        }
    },

    /**
     * 切换标签页
     */
    switchTab(tabName) {
        // 更新标签状态
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新视图显示
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${tabName}-view`).classList.add('active');

        // 切换到排班视图时重新渲染日历
        if (tabName === 'schedule') {
            ScheduleManager.renderCalendar();
        }
    },

    /**
     * 导出数据
     */
    exportData() {
        const data = Storage.exportData();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `coffee-shop-schedule-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('数据导出成功');
    },

    /**
     * 导入数据
     */
    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('导入数据将覆盖现有数据，确定要继续吗？')) {
                    if (Storage.importData(data)) {
                        alert('数据导入成功，页面将重新加载');
                        location.reload();
                    } else {
                        alert('数据导入失败');
                    }
                }
            } catch (error) {
                console.error('导入数据解析失败:', error);
                alert('文件格式错误，请选择有效的JSON文件');
            }
        };
        reader.readAsText(file);
        
        // 重置文件输入
        document.getElementById('importFile').value = '';
    },

    /**
     * 关闭模态框
     */
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
