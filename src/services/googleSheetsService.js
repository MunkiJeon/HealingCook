import { v4 as uuidv4 } from 'uuid';

// Mock Data
const MOCK_USERS = [
    { id: 'admin', password: '123', name: '관리자', branch: '용호동점', role: '매니저' },
    { id: 'staff1', password: '123', name: '직원1', branch: '용호동점', role: '직원' },
    { id: 'staff2', password: '123', name: '직원2', branch: '해운대점', role: '직원' },
];

const MOCK_MENUS = [
    { id: 'm1', name: '배추김치', branch: '힐링쿡', shelfLife: 30, isActive: true },
    { id: 'm2', name: '멸치볶음', branch: '용호동점', shelfLife: 7, isActive: true },
    { id: 'm3', name: '계란말이', branch: '해운대점', shelfLife: 1, isActive: true },
];

let productionLogs = [];
let inventoryLogs = [];

// Helper to simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const googleSheetsService = {
    /**
     * Login user
     * @param {string} id 
     * @param {string} password 
     * @param {string} branch 
     */
    async login(id, password, branch) {
        await delay(500);
        const user = MOCK_USERS.find(u => u.id === id && u.password === password);
        if (!user) throw new Error('아이디 또는 비밀번호가 잘못되었습니다.');
        if (user.branch !== branch && user.branch !== '힐링쿡') { // Assuming '힐링쿡' might be a super admin branch later, but for now strict check
            // Actually, requirement says user has a branch.
            // If user belongs to '용호동점' but tries to login to '해운대점', should we allow?
            // Requirement: "앱에 들어 갈때 지점...을 선택하는 드롭다운과 사번과 비밀번호 를 입력"
            // Let's assume user must match the branch they select, or be a super user.
            if (user.branch !== branch) throw new Error('선택한 지점의 소속 직원이 아닙니다.');
        }
        return user;
    },

    /**
     * Get menus for a branch
     * @param {string} branch 
     */
    async getMenus(branch) {
        await delay(500);
        return MOCK_MENUS.filter(m => m.branch === '힐링쿡' || m.branch === branch);
    },

    /**
     * Add a new menu
     * @param {Omit<import('../types').Menu, 'id'>} menu 
     */
    async addMenu(menu) {
        await delay(500);
        const newMenu = { ...menu, id: uuidv4() };
        MOCK_MENUS.push(newMenu);
        return newMenu;
    },

    /**
     * Update a menu
     * @param {import('../types').Menu} menu 
     */
    async updateMenu(menu) {
        await delay(500);
        const index = MOCK_MENUS.findIndex(m => m.id === menu.id);
        if (index === -1) throw new Error('Menu not found');
        MOCK_MENUS[index] = menu;
        return menu;
    },

    /**
     * Delete a menu (soft delete or hard delete? Req says "Delete", but usually soft is better. Let's hard delete for now as per simple req)
     * @param {string} menuId 
     */
    async deleteMenu(menuId) {
        await delay(500);
        const index = MOCK_MENUS.findIndex(m => m.id === menuId);
        if (index !== -1) MOCK_MENUS.splice(index, 1);
    },

    /**
     * Add production log
     * @param {Omit<import('../types').ProductionLog, 'id'>} log 
     */
    async addProductionLog(log) {
        await delay(500);
        const newLog = { ...log, id: uuidv4() };
        productionLogs.push(newLog);
        return newLog;
    },

    /**
     * Get production logs
     * @param {string} branch 
     */
    async getProductionLogs(branch) {
        await delay(500);
        return productionLogs.filter(l => l.branch === branch);
    },

    /**
     * Add inventory log
     * @param {Omit<import('../types').InventoryLog, 'id'>} log 
     */
    async addInventoryLog(log) {
        await delay(500);
        const newLog = { ...log, id: uuidv4() };
        inventoryLogs.push(newLog);
        return newLog;
    },

    /**
     * Get inventory logs
     * @param {string} branch 
     */
    async getInventoryLogs(branch) {
        await delay(500);
        return inventoryLogs.filter(l => l.branch === branch);
    }
};
