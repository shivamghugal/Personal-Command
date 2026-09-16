import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Task, 
  BankAccount, 
  CreditCard, 
  Bill, 
  Expense, 
  SavingsGoal, 
  CalendarEvent, 
  LifeEvent, 
  Note, 
  NotificationItem, 
  UserPreferences 
} from '../types';
import {
  initialTasks,
  initialBankAccounts,
  initialCreditCards,
  initialBills,
  initialExpenses,
  initialSavingsGoals,
  initialCalendarEvents,
  initialLifeEvents,
  initialNotes,
  initialNotifications,
  initialPreferences
} from '../data/initialData';

// Default clean preferences for Shivam
export const cleanPreferences: UserPreferences = {
  name: 'Shivam',
  greetingTitle: 'Good Day',
  timezone: 'Asia/Kolkata',
  currencySymbol: '₹',
  currencyCode: 'INR',
  workStartTime: '09:00',
  workEndTime: '18:30',
  officeLocation: '',
  homeLocation: '',
  monthlyBudget: 50000,
  monthlyIncome: 95000,
  notificationsEnabled: true,
  locationRemindersEnabled: true,
  soundEnabled: true,
};

// Generic Collection Loaders
export async function loadCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const items: T[] = [];
    snapshot.forEach((d) => {
      items.push({ ...d.data(), id: d.id } as unknown as T);
    });
    return items;
  } catch (error) {
    console.warn(`[Firestore] Could not load ${collectionName}:`, error);
    return [];
  }
}

// Save or Update Single Document
export async function saveDocument<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    console.error(`[Firestore] Error saving ${collectionName}/${item.id}:`, error);
    throw error;
  }
}

// Delete Document
export async function removeDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`[Firestore] Error deleting ${collectionName}/${id}:`, error);
    throw error;
  }
}

// User Preferences persistence
export async function loadPreferences(): Promise<UserPreferences | null> {
  try {
    const snapshot = await getDocs(collection(db, 'settings'));
    let pref: UserPreferences | null = null;
    snapshot.forEach((d) => {
      if (d.id === 'userPreferences') {
        pref = d.data() as UserPreferences;
      }
    });
    return pref;
  } catch (error) {
    console.warn('[Firestore] Error reading preferences:', error);
    return null;
  }
}

export async function savePreferences(preferences: UserPreferences): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'userPreferences');
    await setDoc(docRef, preferences, { merge: true });
  } catch (error) {
    console.error('[Firestore] Error saving preferences:', error);
  }
}

// Fresh reset utility: clears all collections in Firestore so user has a clean fresh start
export async function resetDatabaseToFresh(): Promise<void> {
  const collectionsToClear = [
    'tasks',
    'bankAccounts',
    'creditCards',
    'bills',
    'expenses',
    'savingsGoals',
    'calendarEvents',
    'notes',
    'notifications',
    'lifeEvents'
  ];

  for (const colName of collectionsToClear) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      if (snapshot.size > 0) {
        const batch = writeBatch(db);
        snapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn(`[Firestore] Error clearing collection ${colName}:`, e);
    }
  }

  // Set clean preferences
  await savePreferences(cleanPreferences);
}

// Utility to seed initial demo data if the user wants to populate mock samples
export async function seedDemoData(): Promise<void> {
  const collectionsMap: { name: string; items: any[] }[] = [
    { name: 'tasks', items: initialTasks },
    { name: 'bankAccounts', items: initialBankAccounts },
    { name: 'creditCards', items: initialCreditCards },
    { name: 'bills', items: initialBills },
    { name: 'expenses', items: initialExpenses },
    { name: 'savingsGoals', items: initialSavingsGoals },
    { name: 'calendarEvents', items: initialCalendarEvents },
    { name: 'lifeEvents', items: initialLifeEvents },
    { name: 'notes', items: initialNotes },
    { name: 'notifications', items: initialNotifications },
  ];

  for (const col of collectionsMap) {
    const batch = writeBatch(db);
    col.items.forEach((item) => {
      const docRef = doc(db, col.name, item.id);
      batch.set(docRef, item);
    });
    await batch.commit();
  }

  await savePreferences(initialPreferences);
}
