/**
 * Excel导出模块
 * 负责将排班数据导出为Excel格式的CSV文件
 */

const ExcelExporter = {
    /**
     * 导出当前周的排班数据为Excel格式
     */
    exportWeekSchedule() {
        const weekStart = new Date(ScheduleManager.currentWeekStart);
        const storeId = ScheduleManager.currentStoreId;
        const storeName = storeId === 'all' ? '所有分店' : StoreManager.getById(storeId)?.name || '未知分店';
        
        // 获取一周的日期
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            dates.push({
                date: date,
                dateStr: ScheduleManager.formatDate(date),
                dayName: ScheduleManager.dayNames[i]
            });
        }

        // 获取所有分店（如果是"所有分店"模式）
        const stores = storeId === 'all' ? StoreManager.getAll() : [StoreManager.getById(storeId)];
        
        // 构建表头
        let csvContent = '\uFEFF'; // UTF-8 BOM
        csvContent += `${storeName} - 排班表\n`;
        csvContent += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        
        // 为每个分店生成排班表
        stores.forEach(store => {
            if (!store) return;
            
            csvContent += `【${store.name}】\n`;
            csvContent += '日期,星期,班次,员工,职位,时间\n';
            
            dates.forEach(({ dateStr, dayName }) => {
                const schedules = Storage.getScheduleByDate(dateStr)
                    .filter(s => s.storeId === store.id);
                
                if (schedules.length === 0) {
                    csvContent += `${dateStr},${dayName},无排班,,,\n`;
                } else {
                    schedules.forEach(schedule => {
                        const shift = ShiftManager.getById(schedule.shiftId);
                        const employee = EmployeeManager.getById(schedule.employeeId);
                        
                        if (shift && employee) {
                            csvContent += `${dateStr},${dayName},"${shift.name}","${employee.name}","${employee.position}","${shift.startTime}-${shift.endTime}"\n`;
                        }
                    });
                }
            });
            
            csvContent += '\n';
        });

        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const fileName = `${storeName}_排班表_${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`已导出: ${fileName}`);
    },

    /**
     * 导出指定日期的排班详情
     */
    exportDaySchedule(dateStr) {
        const storeId = ScheduleManager.currentStoreId;
        const storeName = storeId === 'all' ? '所有分店' : StoreManager.getById(storeId)?.name || '未知分店';
        
        const schedules = Storage.getScheduleByDate(dateStr);
        const filteredSchedules = storeId === 'all' ? schedules : schedules.filter(s => s.storeId === storeId);
        
        let csvContent = '\uFEFF'; // UTF-8 BOM
        csvContent += `${storeName} - ${dateStr} 排班详情\n`;
        csvContent += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        csvContent += '分店,班次,员工,职位,时间\n';
        
        if (filteredSchedules.length === 0) {
            csvContent += '暂无排班数据\n';
        } else {
            filteredSchedules.forEach(schedule => {
                const shift = ShiftManager.getById(schedule.shiftId);
                const employee = EmployeeManager.getById(schedule.employeeId);
                const store = StoreManager.getById(schedule.storeId);
                
                if (shift && employee && store) {
                    csvContent += `"${store.name}","${shift.name}","${employee.name}","${employee.position}","${shift.startTime}-${shift.endTime}"\n`;
                }
            });
        }

        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const fileName = `${storeName}_${dateStr}_排班详情.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`已导出: ${fileName}`);
    },

    /**
     * 导出所有排班数据
     */
    exportAllSchedules() {
        const allSchedules = Storage.getSchedules();
        const stores = StoreManager.getAll();
        
        let csvContent = '\uFEFF'; // UTF-8 BOM
        csvContent += '咖啡店排班系统 - 全部排班数据\n';
        csvContent += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        csvContent += '日期,分店,班次,员工,职位,时间\n';
        
        let hasData = false;
        
        // 按日期排序
        const sortedDates = Object.keys(allSchedules).sort();
        
        sortedDates.forEach(dateStr => {
            allSchedules[dateStr].forEach(schedule => {
                const shift = ShiftManager.getById(schedule.shiftId);
                const employee = EmployeeManager.getById(schedule.employeeId);
                const store = StoreManager.getById(schedule.storeId);
                
                if (shift && employee && store) {
                    csvContent += `"${dateStr}","${store.name}","${shift.name}","${employee.name}","${employee.position}","${shift.startTime}-${shift.endTime}"\n`;
                    hasData = true;
                }
            });
        });
        
        if (!hasData) {
            csvContent += '暂无排班数据\n';
        }

        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const fileName = `全部排班数据_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`已导出: ${fileName}`);
    }
};
