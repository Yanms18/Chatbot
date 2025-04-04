"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
class SessionService {
    constructor() {
        this.sessions = new Map();
    }
    // Renamed from createSession to storeSession to avoid duplicate implementation.
    storeSession(deviceId, userData) {
        this.sessions.set(deviceId, userData);
    }
    getSession(deviceId) {
        return this.sessions.get(deviceId);
    }
    deleteSession(deviceId) {
        this.sessions.delete(deviceId);
    }
    clearAllSessions() {
        this.sessions.clear();
    }
    // This method generates and returns a session id.
    createSession(deviceId) {
        // For simplicity, generate a random session id. Optionally, use deviceId.
        return 'session-' + Math.random().toString(36).substring(2, 11);
    }
}
exports.SessionService = SessionService;
