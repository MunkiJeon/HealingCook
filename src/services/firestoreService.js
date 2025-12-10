import { db } from '../lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    getDoc,
    orderBy,
    limit
} from 'firebase/firestore';

export const firestoreService = {
    // --- Users ---
    async getUser(uid) {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { uid, ...docSnap.data() };
        } else {
            return null;
        }
    },

    async updateUser(uid, data) {
        const docRef = doc(db, "users", uid);
        await updateDoc(docRef, data);
    },

    // --- Menus ---
    async getMenus(branch) {
        const q = query(collection(db, "menus"), where("branch", "in", ["힐링쿡", branch]));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addMenu(menu) {
        const docRef = await addDoc(collection(db, "menus"), menu);
        return { id: docRef.id, ...menu };
    },

    async updateMenu(menu) {
        const { id, ...data } = menu;
        const docRef = doc(db, "menus", id);
        await updateDoc(docRef, data);
        return menu;
    },

    async deleteMenu(menuId) {
        await deleteDoc(doc(db, "menus", menuId));
    },

    // --- Production Logs ---
    async getProductionLogs(branch) {
        const q = query(
            collection(db, "productionLogs"),
            where("branch", "==", branch),
            orderBy("timestamp", "desc") // Requires index? Maybe.
        );
        // Note: Compound queries might require an index in Firestore.
        // If "branch" equality and "timestamp" sort are combined.
        // For now, let's try. If it fails, we might need to create an index.
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addProductionLog(log) {
        const docRef = await addDoc(collection(db, "productionLogs"), log);
        return { id: docRef.id, ...log };
    },

    // --- Inventory Logs ---
    async getInventoryLogs(branch) {
        const q = query(
            collection(db, "inventoryLogs"),
            where("branch", "==", branch),
            orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addInventoryLog(log) {
        const docRef = await addDoc(collection(db, "inventoryLogs"), log);
        return { id: docRef.id, ...log };
    }
};
