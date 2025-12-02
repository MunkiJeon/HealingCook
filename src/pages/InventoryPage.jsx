import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { googleSheetsService } from '../services/googleSheetsService';
import { Plus, Search } from 'lucide-react';

export default function InventoryPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        menuId: '',
        quantity: 0,
    });

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [logsData, menusData] = await Promise.all([
                googleSheetsService.getInventoryLogs(user.branch),
                googleSheetsService.getMenus(user.branch)
            ]);
            setLogs(logsData);
            setMenus(menusData.filter(m => m.isActive));
        } catch (error) {
            console.error('Failed to load data', error);
            alert('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedMenu = menus.find(m => m.id === formData.menuId);
            if (!selectedMenu) return;

            const now = new Date();

            await googleSheetsService.addInventoryLog({
                branch: user.branch,
                menuId: selectedMenu.id,
                menuName: selectedMenu.name,
                quantity: Number(formData.quantity),
                author: user.name,
                timestamp: now.toISOString(),
            });

            setIsModalOpen(false);
            setFormData({ menuId: '', quantity: 0 });
            loadData(); // Reload logs
        } catch (error) {
            console.error('Failed to add log', error);
            alert('재고 기록 저장 실패');
        }
    };

    if (loading) return <div className="p-4">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">재고 관리 (마감)</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    마감 재고 입력
                </button>
            </div>

            {/* Logs List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">최근 마감 기록</h3>
                </div>
                <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {logs.length > 0 ? (
                            logs.map((log) => (
                                <li key={log.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-indigo-600 truncate">
                                            {log.menuName}
                                        </div>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {log.quantity}개
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                작성자: {log.author}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <p>
                                                마감일: {new Date(log.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-8 text-center text-gray-500">
                                기록이 없습니다.
                            </li>
                        )}
                    </ul>
                </div>
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
                                        마감 재고 입력
                                    </h3>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label htmlFor="menu" className="block text-sm font-medium text-gray-700">메뉴 선택</label>
                                            <select
                                                id="menu"
                                                required
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                value={formData.menuId}
                                                onChange={(e) => setFormData({ ...formData, menuId: e.target.value })}
                                            >
                                                <option value="">메뉴를 선택하세요</option>
                                                {menus.map((menu) => (
                                                    <option key={menu.id} value={menu.id}>
                                                        {menu.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">수량</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                id="quantity"
                                                required
                                                min="0"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            />
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
