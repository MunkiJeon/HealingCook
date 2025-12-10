import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Building2 } from 'lucide-react';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        branch: '용호동점',
        id: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const branches = ['용호동점', '해운대점', '기타'];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validatePassword = (password) => {
        // Validation: 4-12 chars, !@#$%^&* special chars only allowed
        // Regex: 
        // ^ - start
        // [a-zA-Z0-9!@#$%^&*]{4,12} - allowed chars and length
        // $ - end
        // AND validation usually means "must contain at least one of..." but request says:
        // "PW : (영문 대/소문자, 숫자, 특수문자( !@#$%^&* 만)최소 4자리 최대 12자리)"
        // This phrasing usually means "Only these characters are allowed", OR "Must include these".
        // Given complexity, let's assume it defines the ALLOWED character set and length.
        const regex = /^[a-zA-Z0-9!@#$%^&*]{4,12}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validatePassword(formData.password)) {
            setError('비밀번호는 영문 대/소문자, 숫자, 특수문자(!@#$%^&*)를 포함한 4~12자리여야 합니다.');
            // Note: If strict "contains check" is needed, logic would be different.
            // Current strict set check: "Only composed of these".
            return;
        }

        setLoading(true);

        try {
            // Synthetic Email Construction
            // Convention: [id]@healingcook.com
            const email = `${formData.id}@healingcook.com`;

            // Login with constructed email and password
            const user = await login(email, formData.password);

            // Check if branches match
            if (user.branch !== formData.branch && user.branch !== '힐링쿡') {
                throw new Error('선택한 지점의 소속 직원이 아닙니다.');
            }

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.message.includes('branches') || err.message.includes('직원')) {
                setError(err.message);
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('아이디 또는 비밀번호가 잘못되었습니다.');
            } else {
                setError('로그인 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        if (window.confirm('기존 데이터를 초기화하고 더미 데이터를 생성하시겠습니까? (주의: 기존 계정이 로그아웃됩니다)')) {
            try {
                // Dynamically import to avoid cluttering main bundle
                const { seedDatabase } = await import('../utils/seeder');
                await seedDatabase();
            } catch (e) {
                console.error(e);
                alert('데이터 초기화 실패: ' + e.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        힐링쿡 재고관리
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        지점과 사번으로 로그인하세요
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                                지점 선택
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    id="branch"
                                    name="branch"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.branch}
                                    onChange={handleChange}
                                >
                                    {branches.map((branch) => (
                                        <option key={branch} value={branch}>
                                            {branch}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                                사번 (ID)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="id"
                                    name="id"
                                    type="text"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="예: admin, MK000"
                                    value={formData.id}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                비밀번호
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="4~12자리 (영문, 숫자, 특수문자 !@#$%^&*)"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 border-t border-gray-200 pt-4">
                    <button
                        onClick={handleSeed}
                        className="w-full text-center text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                        개발자 옵션: 데이터 초기화 및 더미 데이터 생성
                    </button>
                </div>
            </div>
        </div>
    );
}
