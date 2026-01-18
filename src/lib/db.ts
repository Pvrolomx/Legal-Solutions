import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface LegalDB extends DBSchema {
  clients: {
    key: string;
    value: {
      id: string;
      name: string;
      phone: string;
      email?: string;
      rfc?: string;
      curp?: string;
      address?: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-name': string };
  };
  cases: {
    key: string;
    value: {
      id: string;
      clientId: string;
      caseNumber?: string;
      matter: string;
      caseType: string;
      status: string;
      court?: string;
      judge?: string;
      opponent?: string;
      opponentLawyer?: string;
      description?: string;
      notes?: string;
      startDate: string;
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-client': string; 'by-status': string };
  };
  documents: {
    key: string;
    value: {
      id: string;
      caseId: string;
      name: string;
      type: string; // 'pdf' | 'docx' | 'doc'
      size: number;
      data: ArrayBuffer;
      createdAt: string;
    };
    indexes: { 'by-case': string };
  };
  hearings: {
    key: string;
    value: {
      id: string;
      caseId: string;
      date: string;
      time: string;
      type: string;
      status: string;
      notes?: string;
      createdAt: string;
    };
    indexes: { 'by-case': string; 'by-date': string };
  };
}

const DB_NAME = 'legal-solutions-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<LegalDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<LegalDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<LegalDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Clients store
      if (!db.objectStoreNames.contains('clients')) {
        const clientStore = db.createObjectStore('clients', { keyPath: 'id' });
        clientStore.createIndex('by-name', 'name');
      }

      // Cases store
      if (!db.objectStoreNames.contains('cases')) {
        const caseStore = db.createObjectStore('cases', { keyPath: 'id' });
        caseStore.createIndex('by-client', 'clientId');
        caseStore.createIndex('by-status', 'status');
      }

      // Documents store
      if (!db.objectStoreNames.contains('documents')) {
        const docStore = db.createObjectStore('documents', { keyPath: 'id' });
        docStore.createIndex('by-case', 'caseId');
      }

      // Hearings store
      if (!db.objectStoreNames.contains('hearings')) {
        const hearingStore = db.createObjectStore('hearings', { keyPath: 'id' });
        hearingStore.createIndex('by-case', 'caseId');
        hearingStore.createIndex('by-date', 'date');
      }
    },
  });

  return dbInstance;
}

// Client operations
export async function getAllClients() {
  const db = await initDB();
  return db.getAll('clients');
}

export async function getClient(id: string) {
  const db = await initDB();
  return db.get('clients', id);
}

export async function saveClient(client: LegalDB['clients']['value']) {
  const db = await initDB();
  return db.put('clients', client);
}

export async function deleteClient(id: string) {
  const db = await initDB();
  return db.delete('clients', id);
}

// Case operations
export async function getAllCases() {
  const db = await initDB();
  return db.getAll('cases');
}

export async function getCase(id: string) {
  const db = await initDB();
  return db.get('cases', id);
}

export async function getCasesByClient(clientId: string) {
  const db = await initDB();
  return db.getAllFromIndex('cases', 'by-client', clientId);
}

export async function saveCase(caseData: LegalDB['cases']['value']) {
  const db = await initDB();
  return db.put('cases', caseData);
}

export async function deleteCase(id: string) {
  const db = await initDB();
  return db.delete('cases', id);
}

// Document operations
export async function getDocumentsByCase(caseId: string) {
  const db = await initDB();
  return db.getAllFromIndex('documents', 'by-case', caseId);
}

export async function getDocument(id: string) {
  const db = await initDB();
  return db.get('documents', id);
}

export async function saveDocument(doc: LegalDB['documents']['value']) {
  const db = await initDB();
  return db.put('documents', doc);
}

export async function deleteDocument(id: string) {
  const db = await initDB();
  return db.delete('documents', id);
}

// Hearing operations
export async function getHearingsByCase(caseId: string) {
  const db = await initDB();
  return db.getAllFromIndex('hearings', 'by-case', caseId);
}

export async function saveHearing(hearing: LegalDB['hearings']['value']) {
  const db = await initDB();
  return db.put('hearings', hearing);
}

export async function deleteHearing(id: string) {
  const db = await initDB();
  return db.delete('hearings', id);
}

// Export all data
export async function exportAllData() {
  const db = await initDB();
  
  const clients = await db.getAll('clients');
  const cases = await db.getAll('cases');
  const documents = await db.getAll('documents');
  const hearings = await db.getAll('hearings');

  // Convert ArrayBuffer to base64 for documents
  const docsWithBase64 = documents.map(doc => ({
    ...doc,
    data: arrayBufferToBase64(doc.data),
  }));

  return {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    clients,
    cases,
    documents: docsWithBase64,
    hearings,
  };
}

// Import all data
export async function importAllData(data: any) {
  const db = await initDB();

  // Clear existing data
  await db.clear('clients');
  await db.clear('cases');
  await db.clear('documents');
  await db.clear('hearings');

  // Import clients
  for (const client of data.clients || []) {
    await db.put('clients', client);
  }

  // Import cases
  for (const caseData of data.cases || []) {
    await db.put('cases', caseData);
  }

  // Import documents (convert base64 back to ArrayBuffer)
  for (const doc of data.documents || []) {
    await db.put('documents', {
      ...doc,
      data: base64ToArrayBuffer(doc.data),
    });
  }

  // Import hearings
  for (const hearing of data.hearings || []) {
    await db.put('hearings', hearing);
  }

  return true;
}

// Utility functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
