import { doc, setDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

const MOCK_USERS = [
    { id: 'admin', password: '1234', name: '관리자', branch: '용호동점', role: '매니저' },
    { id: 'staff1', password: '1234', name: '직원1', branch: '용호동점', role: '직원' },
    { id: 'staff2', password: '1234', name: '직원2', branch: '해운대점', role: '직원' },
    { id: 'MK000', password: '0709', name: '전문기', branch: '용호동점', role: '매니저' },
    { id: 'MK000', password: '0709', name: '전문기', branch: '해운대점', role: '매니저' },
    { id: 'KYH001', password: '0000', name: '김영화', branch: '용호동점', role: '매니저' },
    { id: 'KYH001', password: '0000', name: '김영화', branch: '해운대점', role: '매니저' },
    { id: 'KTH001', password: '0000', name: '김태휘', branch: '용호동점', role: '매니저' },
    { id: 'KMS001', password: '0000', name: '김민성', branch: '해운대점', role: '매니저' },
];

const MOCK_MENUS = [
    { name: '배추김치', branch: '힐링쿡', shelfLife: 30, isActive: true },
    { name: '멸치볶음', branch: '용호동점', shelfLife: 7, isActive: true },
    { name: '계란말이', branch: '해운대점', shelfLife: 1, isActive: true },
];

export const seedDatabase = async () => {
    console.log("Starting seed process...");

    // 1. Seed Menus
    // Check if menus exist to avoid duplicates if run multiple times (simple check)
    // Actually for "Add" it might duplicate, but let's just add them for now or check count.
    const menuSnapshot = await getDocs(collection(db, 'menus'));
    if (menuSnapshot.empty) {
        console.log("Seeding Menus...");
        for (const menu of MOCK_MENUS) {
            await addDoc(collection(db, 'menus'), menu);
        }
    } else {
        console.log("Menus already exist, skipping.");
    }

    // 2. Seed Users & Auth
    // This is tricky because creating auth users logs you in.
    // We will try to create them. If it fails (email in use), we skip creation and just ensure Firestore data.
    console.log("Seeding Users...");

    for (const user of MOCK_USERS) {
        const email = `${user.id}@healingcook.com`;
        let uid = null;

        try {
            console.log(`Creating auth for ${user.id}...`);
            // Attempt to create user
            const userCredential = await createUserWithEmailAndPassword(auth, email, user.password);
            uid = userCredential.user.uid;
            // Creation signs us in, so we might need to sign out if we want to create next?
            // Actually, we can just proceed to update profile, then sign out current temp user?
            // No, `createUser` changes the current `auth.currentUser`.
            // So we loop, create, update firestore, then at the very end sign out.
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`User ${user.id} already exists in Auth. Trying to find UID...`);
                // If we can't delete/recreate easily without admin SDK, 
                // we have to assume the existing UID matches what we want OR we just skip Auth creation.
                // But we need the UID to map Firestore document.
                // We can't easily "get" UID by email on client.
                // Workaround: Try to login to get UID.
                try {
                    const loginCred = await signInWithEmailAndPassword(auth, email, user.password);
                    uid = loginCred.user.uid;
                } catch (loginErr) {
                    console.error(`Could not login as ${user.id} to retrieve UID`, loginErr);
                }
            } else {
                console.error(`Failed to create user ${user.id}`, error);
            }
        }

        if (uid) {
            console.log(`Updating Firestore for ${user.id} (${uid})...`);
            try {
                await setDoc(doc(db, 'users', uid), {
                    name: user.name,
                    branch: user.branch,
                    role: user.role,
                    email: email,
                    employeeId: user.id // Store the ID for reference
                });
            } catch (err) {
                console.error(`Failed to save user doc for ${user.id}`, err);
            }
        }
    }

    // Sign out the last created/logged-in user so the admin/tester is back to clean state
    await signOut(auth);
    console.log("Seeding complete. Signed out.");
    alert("데이터 초기화 완료! 이제 로그인할 수 있습니다.");
};
