/**
 * 排班管理模块
 * 负责日历视图和排班分配功能
 */

const ScheduleManager = {
    currentWeekStart: null,
    currentStoreId: null,
    dayNames: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    weatherData: {}, // 存储天气数据

    /**
     * 初始化日历
     */
    init() {
        this.currentWeekStart = this.getWeekStart(new Date());
        // 设置默认为"所有分店"
        this.currentStoreId = 'all';
        this.renderCalendar();
        this.bindEvents();
        this.renderStoreSelector();
        // 异步加载天气数据，不阻塞页面渲染
        this.loadWeatherData().then(() => this.renderCalendar());
    },

    /**
     * 加载天气数据
     */
    async loadWeatherData() {
        const dates = this.getWeekDates(this.currentWeekStart);
        try {
            const weatherArray = await WeatherAPI.getWeekWeather(dates);
            dates.forEach((dateObj, index) => {
                this.weatherData[dateObj.dateStr] = weatherArray[index];
            });
        } catch (error) {
            console.error('加载天气数据失败:', error);
        }
    },

    /**
     * 获取一周的日期列表
     */
    getWeekDates(weekStart) {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(weekStart.getDate() + i);
            dates.push({
                dateStr: this.formatDate(currentDate),
                date: currentDate
            });
        }
        return dates;
    },

    /**
     * 获取本周一的日期
     */
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    },

    /**
     * 渲染分店选择器
     */
    renderStoreSelector() {
        const container = document.getElementById('storeSelector');
        if (!container) return;
        
        const stores = StoreManager.getAll();
        container.innerHTML = `
            <option value="all" ${this.currentStoreId === 'all' ? 'selected' : ''}>所有分店</option>
            ${stores.map(store => `
                <option value="${store.id}" ${store.id === this.currentStoreId ? 'selected' : ''}>
                    ${this.escapeHtml(store.name)}
                </option>
            `).join('')}
        `;
    },

    /**
     * 切换分店
     */
    switchStore(storeId) {
        this.currentStoreId = storeId;
        this.renderCalendar();
    },

    /**
     * 切换周时重新加载天气
     */
    reloadWeather() {
        return this.loadWeatherData();
    },

    /**
     * 渲染日历
     */
    renderCalendar() {
        const calendarBody = document.getElementById('calendarBody');
        const weekStart = new Date(this.currentWeekStart);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 更新周显示
        this.updateWeekDisplay();

        // 生成7天的日历
        let html = '';
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(weekStart.getDate() + i);
            
            const dateStr = this.formatDate(currentDate);
            const isToday = currentDate.getTime() === today.getTime();
            // 获取当前分店的排班
            const schedules = this.getStoreScheduleByDate(dateStr, this.currentStoreId);

            // 获取天气信息
            const weather = this.weatherData[dateStr];
            const weatherHtml = weather ? `
                <div class="day-weather">
                    <span class="weather-icon">${weather.icon}</span>
                    <span class="weather-text">${weather.text}</span>
                    <span class="weather-temp">${weather.temp}</span>
                </div>
            ` : '';

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}"
                     data-date="${dateStr}"
                     data-day-name="${this.dayNames[i]}"
                     onclick="ScheduleManager.openDaySchedule('${dateStr}')">
                    <div class="day-date">
                        <span class="day-number">${currentDate.getDate()}</span>
                        <span class="day-month">${currentDate.getMonth() + 1}月</span>
                    </div>
                    ${weatherHtml}
                    <div class="day-shifts">
                        ${this.renderDayShifts(schedules, dateStr)}
                    </div>
                    <button class="add-shift-btn" onclick="event.stopPropagation(); ScheduleManager.openAssignModal('${dateStr}')">
                        + 添加班次
                    </button>
                </div>
            `;
        }

        calendarBody.innerHTML = html;
    },

    /**
     * 获取指定分店和日期的排班
     */
    getStoreScheduleByDate(dateStr, storeId) {
        const allSchedules = Storage.getScheduleByDate(dateStr);
        if (storeId === 'all') {
            return allSchedules;
        }
        return allSchedules.filter(s => s.storeId === storeId);
    },

    /**
     * 渲染单日的班次
     */
    renderDayShifts(schedules, dateStr) {
        if (!schedules || schedules.length === 0) {
            return '<div style="color: var(--text-light); font-size: 0.8rem; text-align: center; padding: 0.5rem;">暂无排班</div>';
        }

        return schedules.map(schedule => {
            const shift = ShiftManager.getById(schedule.shiftId);
            const employee = EmployeeManager.getById(schedule.employeeId);
            
            if (!shift || !employee) return '';

            return `
                <div class="shift-item"
                     style="background-color: ${shift.color}20; border-left-color: ${shift.color};"
                     onclick="event.stopPropagation(); ScheduleManager.viewScheduleDetail('${dateStr}', '${schedule.id}')">
                    <div class="shift-item-name">${this.escapeHtml(shift.name)}</div>
                    <div class="shift-item-employee" style="color: ${employee.color}">
                        ${this.escapeHtml(employee.name)}
                    </div>
                    <div class="shift-item-time">${shift.startTime} - ${shift.endTime}</div>
                </div>
            `;
        }).join('');
    },

    /**
     * 更新周显示
     */
    updateWeekDisplay() {
        const weekStart = new Date(this.currentWeekStart);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const formatDate = (date) => {
            return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        };

        document.getElementById('currentWeek').textContent = 
            `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    },

    /**
     * 上一周
     */
    prevWeek() {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
        this.renderCalendar();
        // 异步加载天气数据，不阻塞页面渲染
        this.reloadWeather().then(() => this.renderCalendar());
    },

    /**
     * 下一周
     */
    nextWeek() {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
        this.renderCalendar();
        // 异步加载天气数据，不阻塞页面渲染
        this.reloadWeather().then(() => this.renderCalendar());
    },

    /**
     * 回到今天
     */
    goToToday() {
        this.currentWeekStart = this.getWeekStart(new Date());
        this.renderCalendar();
        // 异步加载天气数据，不阻塞页面渲染
        this.reloadWeather().then(() => this.renderCalendar());
    },

    /**
     * 打开分配班次模态框
     */
    openAssignModal(dateStr) {
        // 设置日期选择器的值
        document.getElementById('assignDate').value = dateStr;
        
        // 填充班次和员工选择框
        ShiftManager.populateSelect(document.getElementById('assignShift'));
        EmployeeManager.populateSelect(document.getElementById('assignEmployee'));
        
        // 设置当前分店
        const storeSelect = document.getElementById('assignStore');
        if (storeSelect) {
            StoreManager.populateSelect(storeSelect);
            storeSelect.value = this.currentStoreId;
        }
        
        this.openModal('assignModal');
    },

    /**
     * 打开分配班次模态框（预选员工）
     */
    openAssignModalWithEmployee(employeeId) {
        // 获取本周第一天
        const today = new Date();
        const dateStr = this.formatDate(today);
        
        this.openAssignModal(dateStr);
        document.getElementById('assignEmployee').value = employeeId;
    },

    /**
     * 保存排班分配
     */
    saveAssignment(formData) {
        const dateStr = formData.get('assignDate');
        const shiftId = formData.get('assignShift');
        const employeeId = formData.get('assignEmployee');
        const storeId = formData.get('assignStore') || this.currentStoreId;

        if (!dateStr || !shiftId || !employeeId || !storeId) {
            alert('请选择日期、分店、班次和员工');
            return false;
        }

        const scheduleItem = {
            storeId: storeId,
            shiftId: shiftId,
            employeeId: employeeId,
            status: 'confirmed'
        };

        if (Storage.addScheduleItem(dateStr, scheduleItem)) {
            this.closeModal('assignModal');
            this.renderCalendar();
            return true;
        }

        alert('保存失败');
        return false;
    },

    /**
     * 打开当日排班详情
     */
    openDaySchedule(dateStr) {
        const schedules = this.getStoreScheduleByDate(dateStr, this.currentStoreId);
        const container = document.getElementById('dayScheduleContent');

        if (!schedules || schedules.length === 0) {
            const storeName = this.currentStoreId === 'all' ? '所有分店' : StoreManager.getById(this.currentStoreId)?.name || '当前分店';
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-text">${storeName}当日暂无排班</div>
                </div>
            `;
        } else {
            container.innerHTML = schedules.map(schedule => {
                const shift = ShiftManager.getById(schedule.shiftId);
                const employee = EmployeeManager.getById(schedule.employeeId);
                const store = StoreManager.getById(schedule.storeId);
                
                if (!shift || !employee) return '';

                return `
                    <div class="day-schedule-item" style="border-left-color: ${shift.color};">
                        <div class="day-schedule-header">
                            <div class="day-schedule-shift">${this.escapeHtml(shift.name)}</div>
                            <div class="day-schedule-time">${shift.startTime} - ${shift.endTime}</div>
                        </div>
                        <div class="day-schedule-employee">
                            <div class="day-schedule-employee-color" style="background-color: ${employee.color}"></div>
                            <div class="day-schedule-employee-name">${this.escapeHtml(employee.name)} - ${this.escapeHtml(employee.position)}</div>
                        </div>
                        ${store ? `<div class="day-schedule-store">📍 ${this.escapeHtml(store.name)}</div>` : ''}
                        <div class="day-schedule-actions">
                            <button class="btn btn-sm btn-danger" onclick="ScheduleManager.deleteSchedule('${dateStr}', '${schedule.id}')">删除</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        this.openModal('dayScheduleModal');
    },

    /**
     * 查看排班详情
     */
    viewScheduleDetail(dateStr, scheduleId) {
        this.openDaySchedule(dateStr);
    },

    /**
     * 删除排班
     */
    deleteSchedule(dateStr, scheduleId) {
        if (confirm('确定要删除这个排班吗？')) {
            if (Storage.deleteScheduleItem(dateStr, scheduleId)) {
                this.closeModal('dayScheduleModal');
                this.renderCalendar();
            } else {
                alert('删除失败');
            }
        }
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 上一周
        document.getElementById('prevWeek').addEventListener('click', () => this.prevWeek());
        
        // 下一周
        document.getElementById('nextWeek').addEventListener('click', () => this.nextWeek());
        
        // 今天
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());

        // 分店选择器
        const storeSelector = document.getElementById('storeSelector');
        if (storeSelector) {
            storeSelector.addEventListener('change', (e) => {
                this.switchStore(e.target.value);
            });
        }

        // 分配表单提交
        document.getElementById('assignForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            // 日期、班次、员工、分店都会自动被FormData捕获
            this.saveAssignment(formData);
        });
    },

    /**
     * 格式化日期为 YYYY-MM-DD
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 格式化日期显示
     */
    formatDateDisplay(dateStr) {
        const date = new Date(dateStr);
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
    },

    /**
     * 打开模态框
     */
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    },

    /**
     * 关闭模态框
     */
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    /**
     * HTML转义，防止XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
