/**
 * @typedef {'용호동점' | '해운대점'} BranchName
 * @typedef {'매니저' | '직원'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id - 사번
 * @property {string} password - 비밀번호
 * @property {string} name - 이름
 * @property {BranchName} branch - 지점명
 * @property {UserRole} role - 권한
 */

/**
 * @typedef {Object} Menu
 * @property {string} id - 메뉴 ID
 * @property {string} name - 메뉴명
 * @property {BranchName | '힐링쿡'} branch - 지점명 (힐링쿡이면 전 지점)
 * @property {number} shelfLife - 유통기한 (일)
 * @property {boolean} isActive - 사용 여부
 */

/**
 * @typedef {Object} ProductionLog
 * @property {string} id - 로그 ID
 * @property {BranchName} branch - 지점명
 * @property {string} menuId - 메뉴 ID
 * @property {string} menuName - 메뉴명 (스냅샷)
 * @property {number} quantity - 수량
 * @property {string} author - 작성자 이름
 * @property {string} timestamp - 생산 일시 (ISO string)
 * @property {string} expiryDate - 폐기 예정일 (ISO string)
 */

/**
 * @typedef {Object} InventoryLog
 * @property {string} id - 로그 ID
 * @property {BranchName} branch - 지점명
 * @property {string} menuId - 메뉴 ID
 * @property {string} menuName - 메뉴명 (스냅샷)
 * @property {number} quantity - 수량
 * @property {string} author - 작성자 이름
 * @property {string} timestamp - 마감 일시 (ISO string)
 */

export { };
