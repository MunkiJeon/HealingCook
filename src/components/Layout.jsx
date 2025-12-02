import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, UtensilsCrossed, Factory, Archive, LogOut, Menu as MenuIcon, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigation = [
        { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
        { name: '메뉴 관리', href: '/menus', icon: UtensilsCrossed, managerOnly: true },
        { name: '생산 관리', href: '/production', icon: Factory },
        { name: '재고 관리', href: '/inventory', icon: Archive },
    ];

    const filteredNavigation = navigation.filter(item =>
        !item.managerOnly || user?.role === '매니저'
    );

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close sidebar</span>
                                <X className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4">
                                <h1 className="text-xl font-bold text-gray-900">힐링쿡</h1>
                            </div>
                            <nav className="mt-5 px-2 space-y-1">
                                {filteredNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={cn(
                                            location.pathname === item.href
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                            'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                                        )}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <item.icon
                                            className={cn(
                                                location.pathname === item.href ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                                                'mr-4 flex-shrink-0 h-6 w-6'
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                            <div className="flex-shrink-0 group block w-full">
                                <div className="flex items-center">
                                    <div className="ml-3">
                                        <p className="text-base font-medium text-gray-700">{user?.name}</p>
                                        <p className="text-xs font-medium text-gray-500">{user?.branch} | {user?.role}</p>
                                    </div>
                                    <button onClick={handleLogout} className="ml-auto p-2 text-gray-400 hover:text-gray-500">
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4">
                                <h1 className="text-xl font-bold text-gray-900">힐링쿡 재고관리</h1>
                            </div>
                            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                                {filteredNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={cn(
                                            location.pathname === item.href ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                location.pathname === item.href ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                                                'mr-3 flex-shrink-0 h-6 w-6'
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                            <div className="flex-shrink-0 w-full group block">
                                <div className="flex items-center">
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                                        <p className="text-xs font-medium text-gray-500">{user?.branch} | {user?.role}</p>
                                    </div>
                                    <button onClick={handleLogout} className="ml-auto p-2 text-gray-400 hover:text-gray-500">
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="lg:hidden">
                    <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-1.5">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">힐링쿡</h1>
                        </div>
                        <div>
                            <button
                                type="button"
                                className="-mr-3 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <span className="sr-only">Open sidebar</span>
                                <MenuIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
                <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
