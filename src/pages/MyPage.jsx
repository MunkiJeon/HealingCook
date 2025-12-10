import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { User, Eye, EyeOff } from 'lucide-react';

export default function MyPage() {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // Update user name in Firestore
            await firestoreService.updateUser(user.uid, {
                ...user,
                name: name
            });

            // Note: Password update requires re-authentication or Firebase Auth API specifically.
            // For MVP, we might skip actual Auth password update unless requested, 
            // but we can update the "name" easily.
            // If the user wants to change password, we'd need email/pass auth provider updatePassword(user, newPass).
            // Let's implement Name update first.

            setMessage('프로필이 업데이트되었습니다.');
        } catch (error) {
            console.error('Failed to update profile', error);
            setMessage('프로필 업데이트 실패: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">마이 페이지</h1>

            <div className="bg-white shadow sm:rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">{user?.email}</h2>
                        <p className="text-sm text-gray-500">지점: {user?.branch}</p>
                        <p className="text-sm text-gray-500">직책: {user?.role || '직원'}</p>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">이름</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Password Update Section - Placeholder for now or simple UI */}
                    {/* 
                    <div>
                        <label className="block text-sm font-medium text-gray-700">새 비밀번호 (변경 시 입력)</label>
                         ... 
                    </div> 
                    */}

                    {message && (
                        <div className={`text-sm ${message.includes('실패') ? 'text-red-600' : 'text-green-600'}`}>
                            {message}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {loading ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
