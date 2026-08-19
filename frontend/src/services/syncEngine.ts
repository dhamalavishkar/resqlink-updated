import { getQueuedRequests, removeQueuedRequest } from './indexedDB';
import { api } from './api';

const API_URL = 'http://localhost:8000';

class SyncEngine {
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log("Network online - triggering sync");
      this.sync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log("Network offline - entering store-and-forward mode");
    });
  }

  public setOnlineStatus(status: boolean) {
    this.isOnline = status;
    if (status) {
      this.sync();
    }
  }

  public getOnlineStatus() {
    return this.isOnline;
  }

  async sync() {
    if (!this.isOnline || this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const queued = await getQueuedRequests();
      if (queued.length === 0) return;

      console.log(`Syncing ${queued.length} requests...`);
      for (const req of queued) {
        try {
          const res = await fetch(`${API_URL}${req.endpoint}`, {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.payload)
          });
          
          if (res.ok) {
            await removeQueuedRequest(req.id);
            console.log(`Synced request ${req.id}`);
          } else {
            console.error(`Failed to sync request ${req.id} - ${res.statusText}`);
          }
        } catch (err) {
          console.error(`Network error syncing request ${req.id}`);
          // Break loop on first network failure to avoid spamming
          break;
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }
}

export const syncEngine = new SyncEngine();
