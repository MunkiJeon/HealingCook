import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleSheetsService } from '../services/googleSheetsService';
import { ArrowLeft } from 'lucide-react';

export default function ProductionFormPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        menuId: '',
        quantity: 0,
    });

    useEffect(() => {
        loadMenus();
    }, [user]);

    const loadMenus = async () => {
        try {
            const data = await googleSheetsService.getMenus(user.branch);
            setMenus(data.filter(m => m.isActive));
        } catch (error) {
            console.error('Failed to load menus', error);
            alert('메뉴를 불러오는데 실패했습니다.');
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
            const expiryDate = new Date();
            expiryDate.setDate(now.getDate() + selectedMenu.shelfLife);

            await googleSheetsService.addProductionLog({
                branch: user.branch,
                menuId: selectedMenu.id,
                menuName: selectedMenu.name,
                quantity: Number(formData.quantity),
                author: user.name,
                timestamp: now.toISOString(),
                expiryDate: expiryDate.toISOString(),
            });

            navigate('/production');
        } catch (error) {
            console.error('Failed to add log', error);
            alert('생산 기록 저장 실패');
        }
    };

    if (loading) return <div className="p-4">로딩 중...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/production')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">생산 입력</h1>
            </div>

            <div className="bg-white shadow sm:rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                                    {menu.name} (유통기한: {menu.shelfLife}일)
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
                            min="1"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/production')}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
