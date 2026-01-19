/**
 * 排班表图片生成模块
 * 负责生成排班表的HTML表格并转换为图片
 */

const ScheduleImageGenerator = {
    /**
     * 生成排班表图片
     */
    async generateScheduleImage() {
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
                dayName: ScheduleManager.dayNames[i],
                displayDate: `${date.getMonth() + 1}/${date.getDate()}`
            });
        }

        // 获取天气数据
        const weatherData = {};
        try {
            const weatherArray = await WeatherAPI.getWeekWeather(dates);
            console.log('获取到的天气数据:', weatherArray);
            dates.forEach((dateObj, index) => {
                weatherData[dateObj.dateStr] = weatherArray[index];
            });
            console.log('天气数据映射:', weatherData);
        } catch (error) {
            console.error('获取天气数据失败:', error);
        }

        // 获取所有员工
        const employees = EmployeeManager.getAll();
        
        // 构建排班数据映射
        const scheduleMap = {};
        dates.forEach(({ dateStr }) => {
            const schedules = Storage.getScheduleByDate(dateStr);
            const filteredSchedules = storeId === 'all' ? schedules : schedules.filter(s => s.storeId === storeId);
            
            filteredSchedules.forEach(schedule => {
                if (!scheduleMap[schedule.employeeId]) {
                    scheduleMap[schedule.employeeId] = {};
                }
                if (!scheduleMap[schedule.employeeId][dateStr]) {
                    scheduleMap[schedule.employeeId][dateStr] = [];
                }
                scheduleMap[schedule.employeeId][dateStr].push(schedule);
            });
        });

        // 生成HTML表格
        let tableHTML = `
            <div style="font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 20px; background: white;">
                <h2 style="text-align: center; color: #8B4513; margin-bottom: 10px;">☕ 咖啡店排班表</h2>
                <p style="text-align: center; color: #666; margin-bottom: 20px;">
                    ${storeName} | ${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - 
                    ${new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).getDate()}日
                </p>
                <table style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #8B4513, #D2691E); color: white;">
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: center; min-width: 100px;">员工</th>
                            ${dates.map(({ dayName, displayDate, dateStr }) => {
                                const weather = weatherData[dateStr];
                                console.log(`日期 ${dateStr} 的天气:`, weather);
                                const weatherInfo = weather ? `<div style="font-size: 11px; margin-top: 4px; opacity: 0.9;">${weather.icon} ${weather.text} ${weather.temp}</div>` : '<div style="font-size: 10px; margin-top: 2px; opacity: 0.7;">天气加载中...</div>';
                                return `
                                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center; min-width: 120px;">
                                        ${dayName}<br><small>${displayDate}</small>${weatherInfo}
                                    </th>
                                `;
                            }).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;

        employees.forEach(employee => {
            tableHTML += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold; background: #f9f9f9;">
                        ${this.escapeHtml(employee.name)}<br>
                        <small style="color: #666; font-weight: normal;">${this.escapeHtml(employee.position)}</small>
                    </td>
            `;

            dates.forEach(({ dateStr }) => {
                const schedules = scheduleMap[employee.id]?.[dateStr] || [];
                
                if (schedules.length === 0) {
                    tableHTML += `
                        <td style="border: 1px solid #ddd; padding: 10px; text-align: center; color: #999; background: #fafafa;">
                            休息
                        </td>
                    `;
                } else {
                    tableHTML += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center; vertical-align: top;">`;
                    
                    schedules.forEach(schedule => {
                        const shift = ShiftManager.getById(schedule.shiftId);
                        const store = StoreManager.getById(schedule.storeId);
                        
                        if (shift) {
                            tableHTML += `
                                <div style="background: ${shift.color}20; border-left: 3px solid ${shift.color}; padding: 6px; margin-bottom: 4px; border-radius: 4px; font-size: 12px;">
                                    <div style="font-weight: bold; color: ${shift.color};">${this.escapeHtml(shift.name)}</div>
                                    <div style="color: #333;">${shift.startTime}-${shift.endTime}</div>
                                    ${store ? `<div style="color: #666; font-size: 11px;">📍 ${this.escapeHtml(store.name)}</div>` : ''}
                                </div>
                            `;
                        }
                    });
                    
                    tableHTML += `</td>`;
                }
            });

            tableHTML += `</tr>`;
        });

        tableHTML += `
                    </tbody>
                </table>
                <p style="text-align: center; color: #999; margin-top: 20px; font-size: 12px;">
                    生成时间: ${new Date().toLocaleString('zh-CN')}
                </p>
            </div>
        `;

        // 创建新窗口显示表格
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>排班表</title>
                <style>
                    body { margin: 0; padding: 0; }
                    @media print {
                        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                ${tableHTML}
                <div style="text-align: center; padding: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #8B4513; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-right: 10px;">🖨️ 打印</button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">✖️ 关闭</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
