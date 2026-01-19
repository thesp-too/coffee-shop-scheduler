/**
 * localStorage 封装模块
 * 负责数据的持久化存储和检索
 */

const Storage = {
    // 存储键名
    KEYS: {
        EMPLOYEES: 'coffee_shop_employees',
        SHIFTS: 'coffee_shop_shifts',
        SCHEDULES: 'coffee_shop_schedules',
        STORES: 'coffee_shop_stores',
        INITIALIZED: 'coffee_shop_initialized'
    },

    /**
     * 获取所有员工
     */
    getEmployees() {
        try {
            const data = localStorage.getItem(this.KEYS.EMPLOYEES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('获取员工数据失败:', error);
            return [];
        }
    },

    /**
     * 保存所有员工
     */
    saveEmployees(employees) {
        try {
            localStorage.setItem(this.KEYS.EMPLOYEES, JSON.stringify(employees));
            return true;
        } catch (error) {
            console.error('保存员工数据失败:', error);
            alert('保存失败，存储空间可能不足');
            return false;
        }
    },

    /**
     * 获取所有班次
     */
    getShifts() {
        try {
            const data = localStorage.getItem(this.KEYS.SHIFTS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('获取班次数据失败:', error);
            return [];
        }
    },

    /**
     * 保存所有班次
     */
    saveShifts(shifts) {
        try {
            localStorage.setItem(this.KEYS.SHIFTS, JSON.stringify(shifts));
            return true;
        } catch (error) {
            console.error('保存班次数据失败:', error);
            alert('保存失败，存储空间可能不足');
            return false;
        }
    },

    /**
     * 获取所有排班
     */
    getSchedules() {
        try {
            const data = localStorage.getItem(this.KEYS.SCHEDULES);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('获取排班数据失败:', error);
            return {};
        }
    },

    /**
     * 保存所有排班
     */
    saveSchedules(schedules) {
        try {
            localStorage.setItem(this.KEYS.SCHEDULES, JSON.stringify(schedules));
            return true;
        } catch (error) {
            console.error('保存排班数据失败:', error);
            alert('保存失败，存储空间可能不足');
            return false;
        }
    },

    /**
     * 获取指定日期的排班
     */
    getScheduleByDate(date) {
        const schedules = this.getSchedules();
        return schedules[date] || [];
    },

    /**
     * 保存指定日期的排班
     */
    saveScheduleByDate(date, scheduleData) {
        const schedules = this.getSchedules();
        schedules[date] = scheduleData;
        return this.saveSchedules(schedules);
    },

    /**
     * 添加排班项
     */
    addScheduleItem(date, scheduleItem) {
        const schedules = this.getSchedules();
        if (!schedules[date]) {
            schedules[date] = [];
        }
        scheduleItem.id = this.generateId();
        schedules[date].push(scheduleItem);
        return this.saveSchedules(schedules);
    },

    /**
     * 删除排班项
     */
    deleteScheduleItem(date, itemId) {
        const schedules = this.getSchedules();
        if (schedules[date]) {
            schedules[date] = schedules[date].filter(item => item.id !== itemId);
            return this.saveSchedules(schedules);
        }
        return false;
    },

    /**
     * 更新排班项
     */
    updateScheduleItem(date, itemId, updatedItem) {
        const schedules = this.getSchedules();
        if (schedules[date]) {
            const index = schedules[date].findIndex(item => item.id === itemId);
            if (index !== -1) {
                schedules[date][index] = { ...schedules[date][index], ...updatedItem };
                return this.saveSchedules(schedules);
            }
        }
        return false;
    },

    /**
     * 检查是否已初始化
     */
    isInitialized() {
        return localStorage.getItem(this.KEYS.INITIALIZED) === 'true';
    },

    /**
     * 标记为已初始化
     */
    markAsInitialized() {
        localStorage.setItem(this.KEYS.INITIALIZED, 'true');
    },

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * 导出所有数据
     */
    exportData() {
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            employees: this.getEmployees(),
            shifts: this.getShifts(),
            schedules: this.getSchedules(),
            stores: this.getStores()
        };
    },

    /**
     * 导入数据
     */
    importData(data) {
        try {
            if (data.employees) {
                this.saveEmployees(data.employees);
            }
            if (data.shifts) {
                this.saveShifts(data.shifts);
            }
            if (data.schedules) {
                this.saveSchedules(data.schedules);
            }
            if (data.stores) {
                this.saveStores(data.stores);
            }
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            alert('导入数据失败，请检查文件格式');
            return false;
        }
    },

    /**
     * 获取所有分店
     */
    getStores() {
        try {
            const data = localStorage.getItem(this.KEYS.STORES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('获取分店数据失败:', error);
            return [];
        }
    },

    /**
     * 保存所有分店
     */
    saveStores(stores) {
        try {
            localStorage.setItem(this.KEYS.STORES, JSON.stringify(stores));
            return true;
        } catch (error) {
            console.error('保存分店数据失败:', error);
            alert('保存失败，存储空间可能不足');
            return false;
        }
    },

    /**
     * 清空所有数据
     */
    clearAll() {
        localStorage.removeItem(this.KEYS.EMPLOYEES);
        localStorage.removeItem(this.KEYS.SHIFTS);
        localStorage.removeItem(this.KEYS.SCHEDULES);
        localStorage.removeItem(this.KEYS.STORES);
        localStorage.removeItem(this.KEYS.INITIALIZED);
    }
};
