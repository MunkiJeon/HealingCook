import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { googleSheetsService } from '../services/googleSheetsService';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MenuManagementPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredMenus = menus.filter(menu =>
        menu.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-4">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">메뉴 관리</h1>
                <button
                    onClick={() => navigate('/menus/new')}
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
                                        onClick={() => navigate(`/menus/${menu.id}/edit`)}
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
        </div>
    );
}
