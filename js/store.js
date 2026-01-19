/**
 * 分店管理模块
 * 负责分店的增删改查操作
 */

const StoreManager = {
    // 默认10家分店
    defaultStores: [
        { id: 'store1', name: '联庄', address: '', phone: '' },
        { id: 'store2', name: '余杭', address: '', phone: '' },
        { id: 'store3', name: '开元', address: '', phone: '' },
        { id: 'store4', name: '浣纱', address: '', phone: '' },
        { id: 'store5', name: '山泽里', address: '', phone: '' },
        { id: 'store6', name: '泰隆', address: '', phone: '' },
        { id: 'store7', name: '城西', address: '', phone: '' },
        { id: 'store8', name: '工厂', address: '', phone: '' },
        { id: 'store9', name: '星光', address: '', phone: '' }
    ],

    /**
     * 获取所有分店
     */
    getAll() {
        try {
            const data = localStorage.getItem(Storage.KEYS.STORES);
            return data ? JSON.parse(data) : this.defaultStores;
        } catch (error) {
            console.error('获取分店数据失败:', error);
            return this.defaultStores;
        }
    },

    /**
     * 保存所有分店
     */
    saveAll(stores) {
        try {
            localStorage.setItem(Storage.KEYS.STORES, JSON.stringify(stores));
            return true;
        } catch (error) {
            console.error('保存分店数据失败:', error);
            alert('保存失败，存储空间可能不足');
            return false;
        }
    },

    /**
     * 根据ID获取分店
     */
    getById(id) {
        const stores = this.getAll();
        return stores.find(store => store.id === id);
    },

    /**
     * 添加分店
     */
    add(storeData) {
        const stores = this.getAll();
        const newStore = {
            id: 'store' + (stores.length + 1),
            name: storeData.name,
            address: storeData.address || '',
            phone: storeData.phone || '',
            createdAt: new Date().toISOString()
        };
        stores.push(newStore);
        return this.saveAll(stores) ? newStore : null;
    },

    /**
     * 更新分店
     */
    update(id, storeData) {
        const stores = this.getAll();
        const index = stores.findIndex(store => store.id === id);
        if (index !== -1) {
            stores[index] = {
                ...stores[index],
                name: storeData.name,
                address: storeData.address || '',
                phone: storeData.phone || '',
                updatedAt: new Date().toISOString()
            };
            return this.saveAll(stores) ? stores[index] : null;
        }
        return null;
    },

    /**
     * 删除分店
     */
    delete(id) {
        const stores = this.getAll();
        const filteredStores = stores.filter(store => store.id !== id);
        if (filteredStores.length < stores.length) {
            return this.saveAll(filteredStores);
        }
        return false;
    },

    /**
     * 渲染分店列表
     */
    renderList() {
        const container = document.getElementById('storeList');
        const stores = this.getAll();

        if (stores.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏪</div>
                    <div class="empty-state-text">暂无分店</div>
                </div>
            `;
            return;
        }

        container.innerHTML = stores.map(store => `
            <div class="store-card fade-in">
                <div class="store-card-header">
                    <div class="store-name">${this.escapeHtml(store.name)}</div>
                </div>
                <div class="store-info">
                    <p><strong>地址:</strong> ${this.escapeHtml(store.address)}</p>
                    <p><strong>电话:</strong> ${this.escapeHtml(store.phone)}</p>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="StoreManager.edit('${store.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="StoreManager.confirmDelete('${store.id}')">删除</button>
                </div>
            </div>
        `).join('');
    },

    /**
     * 渲染分店选择下拉框
     */
    populateSelect(selectElement) {
        const stores = this.getAll();
        selectElement.innerHTML = '<option value="">请选择分店</option>' +
            stores.map(store => `
                <option value="${store.id}">${this.escapeHtml(store.name)}</option>
            `).join('');
    },

    /**
     * 打开添加分店模态框
     */
    openAddModal() {
        document.getElementById('storeModalTitle').textContent = '添加分店';
        document.getElementById('storeForm').reset();
        document.getElementById('storeId').value = '';
        this.openModal('storeModal');
    },

    /**
     * 打开编辑分店模态框
     */
    edit(id) {
        const store = this.getById(id);
        if (!store) {
            alert('分店不存在');
            return;
        }

        document.getElementById('storeModalTitle').textContent = '编辑分店';
        document.getElementById('storeId').value = store.id;
        document.getElementById('storeName').value = store.name;
        document.getElementById('storeAddress').value = store.address || '';
        document.getElementById('storePhone').value = store.phone || '';
        this.openModal('storeModal');
    },

    /**
     * 确认删除分店
     */
    confirmDelete(id) {
        const store = this.getById(id);
        if (!store) {
            alert('分店不存在');
            return;
        }

        if (confirm(`确定要删除分店 "${store.name}" 吗？`)) {
            if (this.delete(id)) {
                this.renderList();
                alert('删除成功');
            } else {
                alert('删除失败');
            }
        }
    },

    /**
     * 保存分店（添加或更新）
     */
    save(formData) {
        const id = formData.get('id');
        const storeData = {
            name: formData.get('name'),
            address: formData.get('address'),
            phone: formData.get('phone')
        };

        let result;
        if (id) {
            result = this.update(id, storeData);
        } else {
            result = this.add(storeData);
        }

        if (result) {
            this.closeModal('storeModal');
            this.renderList();
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
