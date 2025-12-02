import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { googleSheetsService } from '../services/googleSheetsService';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function MenuManagementPage() {
    const { user } = useAuth();
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        shelfLife: 3,
        isActive: true,
    });

    useEffect(() => {
        loadMenus();
    }, [user]);

    const loadMenus = async () => {
        try {
            setLoading(true);
            const data = await googleSheetsService.getMenus(user.branch);
            setMenus(data);
        } catch (error) {
            console.error('Failed to load menus', error);
            alert('메뉴를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await googleSheetsService.deleteMenu(id);
            setMenus(menus.filter(m => m.id !== id));
        } catch (error) {
            console.error('Failed to delete menu', error);
            alert('메뉴 삭제 실패');
        }
    };

    const handleOpenModal = (menu = null) => {
        if (menu) {
            setEditingMenu(menu);
            setFormData({
                name: menu.name,
                shelfLife: menu.shelfLife,
                isActive: menu.isActive,
            });
        } else {
            setEditingMenu(null);
            setFormData({
                name: '',
                shelfLife: 3,
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMenu) {
                await googleSheetsService.updateMenu({
                    ...editingMenu,
                    ...formData,
                });
            } else {
                await googleSheetsService.addMenu({
                    ...formData,
                    branch: user.branch, // Add to current user's branch
                });
            }
            setIsModalOpen(false);
            loadMenus();
        } catch (error) {
            console.error('Failed to save menu', error);
            alert('메뉴 저장 실패');
        }
    };

    const filteredMenus = menus.filter(menu =>
        menu.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-4">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">메뉴 관리</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    메뉴 추가
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="메뉴명 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Menu List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredMenus.map((menu) => (
                        <li key={menu.id}>
                            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="text-sm font-medium text-indigo-600 truncate mr-4">
                                        {menu.name}
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-500">
                                        <span>유통기한: {menu.shelfLife}일</span>
                                        <span>지점: {menu.branch}</span>
                                        <span className={menu.isActive ? 'text-green-600' : 'text-red-600'}>
                                            {menu.isActive ? '사용중' : '미사용'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(menu)}
                                        className="p-2 text-gray-400 hover:text-indigo-600"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(menu.id)}
                                        className="p-2 text-gray-400 hover:text-red-600"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                    {filteredMenus.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">
                            검색 결과가 없습니다.
                        </li>
                    )}
                </ul>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {editingMenu ? '메뉴 수정' : '메뉴 추가'}
                                    </h3>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">메뉴명</label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="shelfLife" className="block text-sm font-medium text-gray-700">유통기한 (일)</label>
                                            <select
                                                id="shelfLife"
                                                name="shelfLife"
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                value={formData.shelfLife}
                                                onChange={(e) => setFormData({ ...formData, shelfLife: Number(e.target.value) })}
                                            >
                                                <option value={3}>3일</option>
                                                <option value={6}>6일</option>
                                                {/* Custom input could be added here if needed */}
                                            </select>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="isActive"
                                                name="isActive"
                                                type="checkbox"
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            />
                                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                                사용 여부
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                    >
                                        저장
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        취소
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
