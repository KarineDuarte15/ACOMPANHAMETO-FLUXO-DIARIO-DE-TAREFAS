import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request necessary Drive and Spreadsheet scopes for managing files and writing rows
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

// In-memory token caching to adhere to strict security guidelines
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize Google OAuth state tracking
export const initGoogleAuth = (
  onSuccess: (user: User, token: string) => void,
  onFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onFailure();
      }
    } else {
      cachedAccessToken = null;
      onFailure();
    }
  });
};

// Sign in via Firebase Popup to get the Google access token
export const googleSignIn = async (): Promise<{ user: User; token: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google OAuth.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, token: cachedAccessToken };
  } catch (error) {
    console.error('Erro de autenticação Google Sheets:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Log out the user
export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Helper to get active cached token
export const getCachedToken = (): string | null => {
  return cachedAccessToken;
};

// Spreadsheet schema and header structure
export const SPREADSHEET_HEADERS = [
  'Data',
  'Horário Agendado',
  'Iniciado Em',
  'Concluído Em',
  'Atividade',
  'BI Relacionado',
  'Prioridade',
  'Duração',
  'Atraso (Segundos)',
  'Motivo do Atraso',
  'Status',
  'Quem foi Informado',
  'Quem Ajudou',
  'Notas / Evidências'
];

export const googleSheetsService = {
  // Check if a Spreadsheet exists and is accessible
  async verifySpreadsheet(spreadsheetId: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (e) {
      console.error('Erro ao verificar planilha:', e);
      return false;
    }
  },

  // Create a brand new Spreadsheet in user's Google Drive and set up the header row
  async createRoutineSpreadsheet(token: string): Promise<string> {
    try {
      // 1. Create spreadsheet file
      const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: 'Hapvida - Acompanhamento de Rotinas Operacionais (Faturamento)'
          },
          sheets: [
            {
              properties: {
                title: 'Histórico'
              }
            }
          ]
        })
      });

      if (!createResponse.ok) {
        throw new Error('Falha ao criar planilha no Google Drive.');
      }

      const spreadsheet = await createResponse.json();
      const spreadsheetId = spreadsheet.spreadsheetId;

      // 2. Set up initial headers in the first row
      await this.appendRow(spreadsheetId, SPREADSHEET_HEADERS, token);

      return spreadsheetId;
    } catch (error) {
      console.error('Erro ao criar planilha Google:', error);
      throw error;
    }
  },

  // Append a list of values as a new row to the Spreadsheet
  async appendRow(spreadsheetId: string, values: any[], token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Histórico!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: 'Histórico!A1',
          majorDimension: 'ROWS',
          values: [values]
        })
      });

      return response.ok;
    } catch (e) {
      console.error('Erro ao adicionar linha à planilha Google:', e);
      return false;
    }
  },

  // Bulk synchronizer to upload entire history or multiple completed items
  async synchronizeRows(spreadsheetId: string, rows: any[][], token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Histórico!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: 'Histórico!A1',
          majorDimension: 'ROWS',
          values: rows
        })
      });

      return response.ok;
    } catch (e) {
      console.error('Erro na sincronização em lote com Google Sheets:', e);
      return false;
    }
  }
};
