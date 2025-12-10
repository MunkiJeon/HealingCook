import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { ArrowLeft, Save, Plus } from 'lucide-react';

export default function MenuFormPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    // forms state: array of objects
    const [forms, setForms] = useState([{
        id: Date.now(), // internal ID for key
        name: '',
        shelfLife: 3,
        isActive: true,
    }]);

    const [loading, setLoading] = useState(isEditMode);

    useEffect(() => {
        if (isEditMode) {
            loadMenu();
        }
    }, [id]);

    const loadMenu = async () => {
        try {
            // Note: firestoreService.getMenus returns all menus, we can also add getMenu(id) to service
            // For now, let's reuse getMenus or implement getMenu. 
            // Better to implement getMenu in service if we want efficiency, but let's filter for now or assume lists are small.
            // Actually, I can just fetch the single doc. But I didn't add getMenu(id) to service yet.
            // Let's just fetch all like before or add a quick getDoc.
            // "getMenus" already implemented. I'll use that.
            const menus = await firestoreService.getMenus(user.branch);
            const menu = menus.find(m => m.id === id);
            if (menu) {
                setForms([{
                    id: Date.now(),
                    menuId: menu.id, // Keep tracking real ID
                    name: menu.name,
                    shelfLife: menu.shelfLife,
                    isActive: menu.isActive,
                }]);
            } else {
                alert('메뉴를 찾을 수 없습니다.');
                navigate('/menus');
            }
        } catch (error) {
            console.error('Failed to load menu', error);
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
                name: '',
                shelfLife: 3,
                isActive: true,
            }
        ]);
    };

    const removeForm = (index) => {
        if (forms.length === 1 && !isEditMode) {
            navigate('/menus');
            return;
        }
        const newForms = forms.filter((_, i) => i !== index);
        setForms(newForms);
    };

    const handleSaveAll = async () => {
        if (!window.confirm(`${forms.length}개의 메뉴를 저장하시겠습니까?`)) return;

        try {
            setLoading(true);
            const promises = forms.map(form => {
                const menuData = {
                    name: form.name,
                    shelfLife: form.shelfLife,
                    isActive: form.isActive,
                    branch: user.branch,
                };

                if (isEditMode && form.menuId) {
                    return firestoreService.updateMenu({ ...menuData, id: form.menuId });
                } else {
                    return firestoreService.addMenu(menuData);
                }
            });

            await Promise.all(promises);
            navigate('/menus');
        } catch (error) {
            console.error('Failed to save menus', error);
            alert('메뉴 저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4">로딩 중...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/menus')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? '메뉴 수정' : '메뉴 일괄 추가'}
                </h1>
            </div>

            {forms.map((form, index) => (
                <div key={form.id} className="bg-white shadow sm:rounded-lg p-6 relative">
                    {!isEditMode && (
                        <button
                            onClick={() => removeForm(index)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <span className="text-xl font-bold">×</span>
                        </button>
                    )}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">메뉴명</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={form.name}
                                onChange={(e) => handleFormChange(index, 'name', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">유통기한 (일)</label>
                            <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={form.shelfLife}
                                onChange={(e) => handleFormChange(index, 'shelfLife', Number(e.target.value))}
                            >
                                <option value={3}>3일</option>
                                <option value={6}>6일</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={form.isActive}
                                onChange={(e) => handleFormChange(index, 'isActive', e.target.checked)}
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                사용 여부
                            </label>
                        </div>
                    </div>
                </div>
            ))}

            {!isEditMode && (
                <div className="flex justify-center">
                    <button
                        onClick={addForm}
                        className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus className="h-8 w-8 text-gray-600" />
                    </button>
                </div>
            )}

            {/* Global Save Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end max-w-7xl mx-auto z-10">
                <button
                    onClick={handleSaveAll}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Save className="-ml-1 mr-2 h-5 w-5" />
                    {isEditMode ? '수정 내용 저장' : '일괄 저장'}
                </button>
            </div>

            {/* Added spacer to prevent button overlap content */}
            <div className="h-16"></div>
        </div>
    );
}
// Need to import Plus icon which is used but not imported in my replacement content
// wait, I see I didn't include Plus in imports in my replacement content above
// I'll add it now.
