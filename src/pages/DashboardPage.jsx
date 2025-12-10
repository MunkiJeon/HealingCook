import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { Factory, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayProduction: 0,
    lastInventory: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.branch) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [prodLogs, invLogs] = await Promise.all([
        firestoreService.getProductionLogs(user.branch),
        firestoreService.getInventoryLogs(user.branch)
      ]);

      const today = new Date().toDateString();
      const todayProd = prodLogs
        .filter(log => new Date(log.timestamp).toDateString() === today)
        .reduce((sum, log) => sum + log.quantity, 0);

      const lastInv = invLogs.length > 0 ? invLogs[invLogs.length - 1].quantity : 0;
      // Note: "Cumulative Inventory" usually means current stock, which is hard to calculate from logs alone without a running total logic.
      // But the requirement says "Cumulative Inventory Record" -> Click to see Inventory Screen.
      // For the stat, maybe just showing "Latest Count" or count of logs? 
      // The original code took the quantity of the *last log*.
      // We will stick to that logic or maybe just show the number of logs for today?
      // Let's stick to original logic: quantity of last inventory log (assuming it's a "stocktake" log).

      const combinedLogs = [
        ...prodLogs.map(l => ({ ...l, type: 'production' })),
        ...invLogs.map(l => ({ ...l, type: 'inventory' }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

      setStats({
        todayProduction: todayProd,
        lastInventory: invLogs.length
      });
      setRecentLogs(combinedLogs);

    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecentActivityClick = (log) => {
    // 3-3 "배추김치(생산)" 항목 클릭시 해당 "생산 관리" 화면의 해당 메뉴 상세 화면으로 이동
    // We don't have a "Menu Detail Screen" in Production/Inventory pages yet, mostly just lists.
    // But we can navigate to the list.
    // Ideally we'd highlight it, but for now just navigating to the correct page is a good step.
    if (log.type === 'production') {
      navigate('/production');
    } else {
      navigate('/inventory');
    }
  };

  if (loading) return <div className="p-4">로딩 중...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">대시보드</h1>
      <div className="mt-4">
        <p className="text-gray-600">환영합니다, <span className="font-bold text-indigo-600">{user?.name}</span>님 ({user?.branch})</p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/production')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Factory className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">오늘 총 생산량</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.todayProduction}개</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/inventory')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Archive className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">누적 재고 기록</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.lastInventory}건</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-lg leading-6 font-medium text-gray-900">최근 활동</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {recentLogs.map((log) => (
              <li
                key={log.id}
                onClick={() => handleRecentActivityClick(log)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {log.menuName}
                      <span className="text-gray-500 font-normal"> ({log.type === 'production' ? '생산' : '재고마감'})</span>
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {log.quantity}개
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {log.author}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {recentLogs.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                최근 활동이 없습니다.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
