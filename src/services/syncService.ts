// src/services/syncService.ts
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { AppState } from '../types';

const COLLECTION_NAME = 'appState';

export const syncService = {
  /**
   * Grava o estado atual da aplicação no Firestore para sincronização em tempo real.
   */
  async saveStateToFirebase(dateStr: string, state: AppState): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, `state_${dateStr}`);
      // Salvamos as propriedades essenciais que precisam ser sincronizadas
      await setDoc(docRef, {
        executions: state.executions || [],
        currentExecutionId: state.currentExecutionId || null,
        activeBreak: state.activeBreak || null,
        config: state.config || {},
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('❌ Erro ao salvar estado no Firebase:', error);
    }
  },

  /**
   * Assina atualizações em tempo real do estado da rotina no Firestore para o dia especificado.
   */
  subscribeToState(dateStr: string, callback: (data: any) => void) {
    const docRef = doc(db, COLLECTION_NAME, `state_${dateStr}`);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data);
      }
    }, (error) => {
      console.error('❌ Erro na sincronização em tempo real do Firebase:', error);
    });
  }
};
