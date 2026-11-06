/**
 * Firestore Synchronization Service for Breakout Radar
 * Enables multi-user cloud persistence for artists, A&R committee decisions,
 * scan history, and custom workspace settings with robust local cache fallbacks.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase';
import { RealArtistData, ARDecision } from '../types';

/**
 * Save or update an artist record in Firestore
 */
export async function syncArtistToFirestore(artist: RealArtistData): Promise<boolean> {
  try {
    if (!artist || !artist.id) return false;
    const docRef = doc(db, 'artists', String(artist.id));
    await setDoc(docRef, {
      ...artist,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firestore] Sync artist failed (falling back to local cache):', err);
    return false;
  }
}

/**
 * Batch sync discovered artists to Firestore
 */
export async function batchSyncArtistsToFirestore(artists: RealArtistData[]): Promise<number> {
  let count = 0;
  for (const artist of artists) {
    const success = await syncArtistToFirestore(artist);
    if (success) count++;
  }
  return count;
}

/**
 * Load all verified artists from Firestore
 */
export async function loadArtistsFromFirestore(): Promise<RealArtistData[]> {
  try {
    const colRef = collection(db, 'artists');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return [];
    
    const results: RealArtistData[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as RealArtistData;
      if (data && data.name) {
        results.push(data);
      }
    });
    return results;
  } catch (err) {
    console.warn('[Firestore] Load artists failed:', err);
    return [];
  }
}

/**
 * Save an A&R committee decision to Firestore
 */
export async function saveDecisionToFirestore(decision: ARDecision): Promise<boolean> {
  try {
    if (!decision || !decision.id) return false;
    const docRef = doc(db, 'decisions', decision.id);
    await setDoc(docRef, {
      ...decision,
      createdAt: decision.createdAt || new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn('[Firestore] Save decision failed:', err);
    return false;
  }
}

/**
 * Load recent decisions from Firestore
 */
export async function loadDecisionsFromFirestore(): Promise<ARDecision[]> {
  try {
    const colRef = collection(db, 'decisions');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    const results: ARDecision[] = [];
    snapshot.forEach(docSnap => {
      results.push(docSnap.data() as ARDecision);
    });
    return results;
  } catch (err) {
    console.warn('[Firestore] Load decisions failed:', err);
    return [];
  }
}

/**
 * Save workspace configuration (regions, genres, loop interval)
 */
export async function saveSettingsToFirestore(settings: Record<string, any>): Promise<boolean> {
  try {
    const docRef = doc(db, 'settings', 'workspace_default');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firestore] Save settings failed:', err);
    return false;
  }
}

/**
 * Load workspace configuration from Firestore
 */
export async function loadSettingsFromFirestore(): Promise<Record<string, any> | null> {
  try {
    const docRef = doc(db, 'settings', 'workspace_default');
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn('[Firestore] Load settings failed:', err);
    return null;
  }
}
