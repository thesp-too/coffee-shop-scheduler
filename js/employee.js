/**
 * 员工管理模块
 * 负责员工的增删改查操作
 */

const EmployeeManager = {
    /**
     * 获取所有员工
     */
    getAll() {
        return Storage.getEmployees();
    },

    /**
     * 根据ID获取员工
     */
    getById(id) {
        const employees = this.getAll();
        return employees.find(emp => emp.id === id);
    },

    /**
     * 添加员工
     */
    add(employeeData) {
        const employees = this.getAll();
        const newEmployee = {
            id: Storage.generateId(),
            name: employeeData.name,
            position: employeeData.position,
            phone: employeeData.phone || '',
            email: employeeData.email || '',
            color: employeeData.color || '#3498db',
            createdAt: new Date().toISOString()
        };
        employees.push(newEmployee);
        return Storage.saveEmployees(employees) ? newEmployee : null;
    },

    /**
     * 更新员工
     */
    update(id, employeeData) {
        const employees = this.getAll();
        const index = employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            employees[index] = {
                ...employees[index],
                name: employeeData.name,
                position: employeeData.position,
                phone: employeeData.phone || '',
                email: employeeData.email || '',
                color: employeeData.color || employees[index].color,
                updatedAt: new Date().toISOString()
            };
            return Storage.saveEmployees(employees) ? employees[index] : null;
        }
        return null;
    },

    /**
     * 删除员工
     */
    delete(id) {
        const employees = this.getAll();
        const filteredEmployees = employees.filter(emp => emp.id !== id);
        if (filteredEmployees.length < employees.length) {
            return Storage.saveEmployees(filteredEmployees);
        }
        return false;
    },

    /**
     * 渲染员工列表
     */
    renderList() {
        const container = document.getElementById('employeeList');
        const employees = this.getAll();

        if (employees.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-text">暂无员工，请添加员工</div>
                </div>
            `;
            return;
        }

        container.innerHTML = employees.map(emp => `
            <div class="employee-card fade-in">
                <div class="employee-card-header">
                    <div class="employee-name">${this.escapeHtml(emp.name)}</div>
                    <div class="employee-color-indicator" style="background-color: ${emp.color}"></div>
                </div>
                <div class="employee-info">
                    <p><strong>职位:</strong> ${this.escapeHtml(emp.position)}</p>
                    ${emp.phone ? `<p><strong>电话:</strong> ${this.escapeHtml(emp.phone)}</p>` : ''}
                    ${emp.email ? `<p><strong>邮箱:</strong> ${this.escapeHtml(emp.email)}</p>` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="EmployeeManager.edit('${emp.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="EmployeeManager.confirmDelete('${emp.id}')">删除</button>
                </div>
            </div>
        `).join('');
    },

    /**
     * 渲染快速员工列表（侧边栏）
     */
    renderQuickList() {
        const container = document.getElementById('employeeQuickList');
        const employees = this.getAll();

        if (employees.length === 0) {
            container.innerHTML = '<p style="color: var(--text-light); text-align: center;">暂无员工</p>';
            return;
        }

        container.innerHTML = employees.map(emp => `
            <div class="employee-quick-item" onclick="ScheduleManager.openAssignModalWithEmployee('${emp.id}')">
                <div class="employee-quick-color" style="background-color: ${emp.color}"></div>
                <div class="employee-quick-name">${this.escapeHtml(emp.name)}</div>
                <div class="employee-quick-position">${this.escapeHtml(emp.position)}</div>
            </div>
        `).join('');
    },

    /**
     * 填充员工选择下拉框
     */
    populateSelect(selectElement) {
        const employees = this.getAll();
        selectElement.innerHTML = '<option value="">请选择员工</option>' +
            employees.map(emp => `
                <option value="${emp.id}">${this.escapeHtml(emp.name)} - ${this.escapeHtml(emp.position)}</option>
            `).join('');
    },

    /**
     * 打开添加员工模态框
     */
    openAddModal() {
        document.getElementById('employeeModalTitle').textContent = '添加员工';
        document.getElementById('employeeForm').reset();
        document.getElementById('employeeId').value = '';
        document.getElementById('employeeColor').value = '#3498db';
        this.openModal('employeeModal');
    },

    /**
     * 打开编辑员工模态框
     */
    edit(id) {
        const employee = this.getById(id);
        if (!employee) {
            alert('员工不存在');
            return;
        }

        document.getElementById('employeeModalTitle').textContent = '编辑员工';
        document.getElementById('employeeId').value = employee.id;
        document.getElementById('employeeName').value = employee.name;
        document.getElementById('employeePosition').value = employee.position;
        document.getElementById('employeePhone').value = employee.phone || '';
        document.getElementById('employeeEmail').value = employee.email || '';
        document.getElementById('employeeColor').value = employee.color;
        this.openModal('employeeModal');
    },

    /**
     * 确认删除员工
     */
    confirmDelete(id) {
        const employee = this.getById(id);
        if (!employee) {
            alert('员工不存在');
            return;
        }

        if (confirm(`确定要删除员工 "${employee.name}" 吗？`)) {
            if (this.delete(id)) {
                this.renderList();
                this.renderQuickList();
                alert('删除成功');
            } else {
                alert('删除失败');
            }
        }
    },

    /**
     * 保存员工（添加或更新）
     */
    save(formData) {
        const id = formData.get('id');
        const employeeData = {
            name: formData.get('name'),
            position: formData.get('position'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            color: formData.get('color')
        };

        let result;
        if (id) {
            result = this.update(id, employeeData);
        } else {
            result = this.add(employeeData);
        }

        if (result) {
            this.closeModal('employeeModal');
            this.renderList();
            this.renderQuickList();
            return true;
        }
        return false;
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
