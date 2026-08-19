import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface RescueMeshDB extends DBSchema {
  outbox: {
    key: string;
    value: {
      id: string;
      endpoint: string;
      method: string;
      payload: any;
      timestamp: number;
    };
  };
  mesh_messages: {
    key: string;
    value: {
      id: string;
      senderId: string;
      receiverId: string;
      payload: any;
      priority: string;
      timestamp: string;
      ttl: number;
      hopCount: number;
      routeHistory: string[];
      status: string;
    };
  };
  cache: {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<RescueMeshDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<RescueMeshDB>('resqlink-mesh', 1, {
      upgrade(db) {
        db.createObjectStore('outbox', { keyPath: 'id' });
        db.createObjectStore('mesh_messages', { keyPath: 'id' });
        db.createObjectStore('cache', { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
};

export const queueRequest = async (endpoint: string, method: string, payload: any) => {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db.put('outbox', {
    id,
    endpoint,
    method,
    payload,
    timestamp: Date.now(),
  });
  return id;
};

export const getQueuedRequests = async () => {
  const db = await getDB();
  return db.getAll('outbox');
};

export const removeQueuedRequest = async (id: string) => {
  const db = await getDB();
  await db.delete('outbox', id);
};

export const saveMeshMessage = async (message: any) => {
  const db = await getDB();
  await db.put('mesh_messages', message);
};

export const getMeshMessages = async () => {
  const db = await getDB();
  return db.getAll('mesh_messages');
};

export const setCache = async (key: string, data: any) => {
  const db = await getDB();
  await db.put('cache', { key, data, timestamp: Date.now() });
};

export const getCache = async (key: string) => {
  const db = await getDB();
  const entry = await db.get('cache', key);
  return entry ? entry.data : null;
};
