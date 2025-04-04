export class SessionService {
    private sessions: Map<string, any>;

    constructor() {
        this.sessions = new Map();
    }

    // Renamed from createSession to storeSession to avoid duplicate implementation.
    public storeSession(deviceId: string, userData: any): void {
        this.sessions.set(deviceId, userData);
    }

    public getSession(deviceId: string) {
        return this.sessions.get(deviceId);
    }

    public deleteSession(deviceId: string): void {
        this.sessions.delete(deviceId);
    }

    public clearAllSessions(): void {
        this.sessions.clear();
    }

    // This method generates and returns a session id.
    public createSession(deviceId?: string): string {
        // For simplicity, generate a random session id. Optionally, use deviceId.
        return 'session-' + Math.random().toString(36).substring(2, 11);
    }
}