/**
 * 班次管理模块
 * 负责班次类型的增删改查操作
 */

const ShiftManager = {
    /**
     * 获取所有班次
     */
    getAll() {
        return Storage.getShifts();
    },

    /**
     * 根据ID获取班次
     */
    getById(id) {
        const shifts = this.getAll();
        return shifts.find(shift => shift.id === id);
    },

    /**
     * 添加班次
     */
    add(shiftData) {
        const shifts = this.getAll();
        const newShift = {
            id: Storage.generateId(),
            name: shiftData.name,
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            color: shiftData.color || '#2ecc71',
            createdAt: new Date().toISOString()
        };
        shifts.push(newShift);
        return Storage.saveShifts(shifts) ? newShift : null;
    },

    /**
     * 更新班次
     */
    update(id, shiftData) {
        const shifts = this.getAll();
        const index = shifts.findIndex(shift => shift.id === id);
        if (index !== -1) {
            shifts[index] = {
                ...shifts[index],
                name: shiftData.name,
                startTime: shiftData.startTime,
                endTime: shiftData.endTime,
                color: shiftData.color || shifts[index].color,
                updatedAt: new Date().toISOString()
            };
            return Storage.saveShifts(shifts) ? shifts[index] : null;
        }
        return null;
    },

    /**
     * 删除班次
     */
    delete(id) {
        const shifts = this.getAll();
        const filteredShifts = shifts.filter(shift => shift.id !== id);
        if (filteredShifts.length < shifts.length) {
            return Storage.saveShifts(filteredShifts);
        }
        return false;
    },

    /**
     * 渲染班次列表
     */
    renderList() {
        const container = document.getElementById('shiftList');
        const shifts = this.getAll();

        if (shifts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🕐</div>
                    <div class="empty-state-text">暂无班次，请添加班次</div>
                </div>
            `;
            return;
        }

        container.innerHTML = shifts.map(shift => `
            <div class="shift-card fade-in">
                <div class="shift-card-header">
                    <div class="shift-name">${this.escapeHtml(shift.name)}</div>
                    <div class="shift-color-indicator" style="background-color: ${shift.color}"></div>
                </div>
                <div class="shift-info">
                    <p><strong>时间:</strong> ${shift.startTime} - ${shift.endTime}</p>
                    <p><strong>时长:</strong> ${this.calculateDuration(shift.startTime, shift.endTime)}</p>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="ShiftManager.edit('${shift.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="ShiftManager.confirmDelete('${shift.id}')">删除</button>
                </div>
            </div>
        `).join('');
    },

    /**
     * 填充班次选择下拉框
     */
    populateSelect(selectElement) {
        const shifts = this.getAll();
        selectElement.innerHTML = '<option value="">请选择班次</option>' +
            shifts.map(shift => `
                <option value="${shift.id}">${this.escapeHtml(shift.name)} (${shift.startTime} - ${shift.endTime})</option>
            `).join('');
    },

    /**
     * 打开添加班次模态框
     */
    openAddModal() {
        document.getElementById('shiftModalTitle').textContent = '添加班次';
        document.getElementById('shiftForm').reset();
        document.getElementById('shiftId').value = '';
        document.getElementById('shiftColor').value = '#2ecc71';
        this.openModal('shiftModal');
    },

    /**
     * 打开编辑班次模态框
     */
    edit(id) {
        const shift = this.getById(id);
        if (!shift) {
            alert('班次不存在');
            return;
        }

        document.getElementById('shiftModalTitle').textContent = '编辑班次';
        document.getElementById('shiftId').value = shift.id;
        document.getElementById('shiftName').value = shift.name;
        document.getElementById('shiftStartTime').value = shift.startTime;
        document.getElementById('shiftEndTime').value = shift.endTime;
        document.getElementById('shiftColor').value = shift.color;
        this.openModal('shiftModal');
    },

    /**
     * 确认删除班次
     */
    confirmDelete(id) {
        const shift = this.getById(id);
        if (!shift) {
            alert('班次不存在');
            return;
        }

        if (confirm(`确定要删除班次 "${shift.name}" 吗？`)) {
            if (this.delete(id)) {
                this.renderList();
                alert('删除成功');
            } else {
                alert('删除失败');
            }
        }
    },

    /**
     * 保存班次（添加或更新）
     */
    save(formData) {
        const id = formData.get('id');
        const shiftData = {
            name: formData.get('name'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            color: formData.get('color')
        };

        // 验证时间
        if (shiftData.startTime >= shiftData.endTime) {
            alert('结束时间必须晚于开始时间');
            return false;
        }

        let result;
        if (id) {
            result = this.update(id, shiftData);
        } else {
            result = this.add(shiftData);
        }

        if (result) {
            this.closeModal('shiftModal');
            this.renderList();
            return true;
        }
        return false;
    },

    /**
     * 计算班次时长
     */
    calculateDuration(startTime, endTime) {
        const start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);
        const diff = end - start;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`;
    },

    /**
     * 将时间字符串转换为分钟数
     */
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
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
