// src/services/authService.ts
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as AuthUser,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  collection, 
  updateDoc
} from 'firebase/firestore';
import { User, TeamSettings } from '../types';

const USERS_COLLECTION = 'users';
const SETTINGS_COLLECTION = 'teamSettings';
const LOGS_COLLECTION = 'auditLogs';

export const authService = {
  /**
   * Realiza o login seguro com e-mail e senha no Firebase Auth.
   */
  async login(email: string, password: string): Promise<AuthUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const authUser = userCredential.user;
    
    // Registrar auditoria de login
    await this.logAction(authUser.uid, 'LOGIN', 'auth_session', authUser.uid, { email });
    
    return authUser;
  },

  /**
   * Registra um novo usuário no Auth e cria seu perfil no Firestore.
   */
  async register(email: string, password: string, nome: string, role: 'ADMIN' | 'USER'): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const authUser = userCredential.user;
    
    const newUser: User = {
      id: authUser.uid,
      nome,
      email,
      role,
      ativo: true
    };
    
    await this.saveProfile(newUser);
    
    // Registrar auditoria de cadastro
    await this.logAction(authUser.uid, 'REGISTER', 'users', authUser.uid, { email, role });
    
    return newUser;
  },

  /**
   * Realiza o logout encerrando a sessão do Firebase e limpando estados.
   */
  async logout(userId?: string): Promise<void> {
    if (userId) {
      await this.logAction(userId, 'LOGOUT', 'auth_session', userId);
    }
    await firebaseSignOut(auth);
  },

  /**
   * Dispara o fluxo seguro de redefinição de senha do Firebase.
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Obtém o perfil de usuário do Firestore.
   */
  async getProfile(uid: string): Promise<User | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as User;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar perfil no Firestore:', error);
      throw error;
    }
  },

  /**
   * Salva ou atualiza o perfil do usuário no Firestore.
   */
  async saveProfile(user: User): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, user, { merge: true });
  },

  /**
   * Adiciona um registro de auditoria append-only no Firestore.
   */
  async logAction(
    actorUserId: string, 
    action: string, 
    resource: string, 
    resourceId?: string, 
    metadata?: any
  ): Promise<void> {
    try {
      const logsRef = collection(db, LOGS_COLLECTION);
      await addDoc(logsRef, {
        actorUserId,
        action,
        resource,
        resourceId: resourceId || null,
        metadata: metadata || null,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('⚠️ Falha ao registrar log de auditoria:', e);
    }
  },

  /**
   * Monitora em tempo real o estado da sessão de autenticação.
   */
  onSessionChange(callback: (authUser: AuthUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
