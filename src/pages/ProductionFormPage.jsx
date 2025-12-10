import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { ArrowLeft, Save, Plus } from 'lucide-react';

export default function ProductionFormPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);

    const [forms, setForms] = useState([{
        id: Date.now(),
        menuId: '',
        quantity: 0,
    }]);

    useEffect(() => {
        if (user && user.branch) {
            loadMenus();
        }
    }, [user]);

    const loadMenus = async () => {
        try {
            const data = await firestoreService.getMenus(user.branch);
            setMenus(data.filter(m => m.isActive));
        } catch (error) {
            console.error('Failed to load menus', error);
            alert('메뉴를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (index, field, value) => {
        const newForms = [...forms];
        newForms[index] = { ...newForms[index], [field]: value };
        setForms(newForms);
    };

    const addForm = () => {
        setForms([
            ...forms,
            {
                id: Date.now(),
                menuId: '',
                quantity: 0,
            }
        ]);
    };

    const removeForm = (index) => {
        if (forms.length === 1) {
            navigate('/production');
            return;
        }
        const newForms = forms.filter((_, i) => i !== index);
        setForms(newForms);
    };

    const handleSaveAll = async () => {
        if (!window.confirm(`${forms.length}개의 생산 기록을 저장하시겠습니까?`)) return;

        try {
            setLoading(true);
            const now = new Date();
            const timestamp = now.toISOString();

            const promises = forms.map(form => {
                const selectedMenu = menus.find(m => m.id === form.menuId);
                if (!selectedMenu) return null; // Skip invalid entries

                const expiryDate = new Date();
                expiryDate.setDate(now.getDate() + selectedMenu.shelfLife);

                return firestoreService.addProductionLog({
                    branch: user.branch,
                    menuId: selectedMenu.id,
                    menuName: selectedMenu.name,
                    quantity: Number(form.quantity),
                    author: user.name || 'Unknown', // Handle missing name
                    timestamp: timestamp,
                    expiryDate: expiryDate.toISOString(),
                });
            });

            await Promise.all(promises.filter(p => p !== null));
            navigate('/production');
        } catch (error) {
            console.error('Failed to add logs', error);
            alert('생산 기록 저장 실패');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4">로딩 중...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/production')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">생산 일괄 입력</h1>
            </div>

            {forms.map((form, index) => (
                <div key={form.id} className="bg-white shadow sm:rounded-lg p-6 relative">
                    <button
                        onClick={() => removeForm(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <span className="text-xl font-bold">×</span>
                    </button>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">메뉴 선택</label>
                            <select
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={form.menuId}
                                onChange={(e) => handleFormChange(index, 'menuId', e.target.value)}
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
                            <label className="block text-sm font-medium text-gray-700">수량</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={form.quantity}
                                onChange={(e) => handleFormChange(index, 'quantity', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            ))}

            <div className="flex justify-center">
                <button
                    onClick={addForm}
                    className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="h-8 w-8 text-gray-600" />
                </button>
            </div>

            {/* Global Save Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end max-w-7xl mx-auto z-10">
                <button
                    onClick={handleSaveAll}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Save className="-ml-1 mr-2 h-5 w-5" />
                    일괄 저장
                </button>
            </div>
            <div className="h-16"></div>
        </div>
    );
}
