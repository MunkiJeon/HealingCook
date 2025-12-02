import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleSheetsService } from '../services/googleSheetsService';
import { ArrowLeft } from 'lucide-react';

export default function MenuFormPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        shelfLife: 3,
        isActive: true,
    });
    const [loading, setLoading] = useState(isEditMode);

    useEffect(() => {
        if (isEditMode) {
            loadMenu();
        }
    }, [id]);

    const loadMenu = async () => {
        try {
            const menus = await googleSheetsService.getMenus(user.branch);
            const menu = menus.find(m => m.id === id);
            if (menu) {
                setFormData({
                    name: menu.name,
                    shelfLife: menu.shelfLife,
                    isActive: menu.isActive,
                });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await googleSheetsService.updateMenu({
                    id,
                    ...formData,
                    branch: user.branch, // Preserve branch or update? Usually preserve.
                });
            } else {
                await googleSheetsService.addMenu({
                    ...formData,
                    branch: user.branch,
                });
            }
            navigate('/menus');
        } catch (error) {
            console.error('Failed to save menu', error);
            alert('메뉴 저장 실패');
        }
    };

    if (loading) return <div className="p-4">로딩 중...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/menus')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? '메뉴 수정' : '메뉴 추가'}
                </h1>
            </div>

            <div className="bg-white shadow sm:rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
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

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/menus')}
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
