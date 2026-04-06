const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.mdstitch');
const SESSION_FILE = path.join(CONFIG_DIR, 'session.json');

function saveSession(session) {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(SESSION_FILE, JSON.stringify(session), 'utf8');
}

function loadSession() {
    if (!fs.existsSync(SESSION_FILE)) return null;
    try {
        return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    } catch {
        return null;
    }
}

function clearSession() {
    if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
}

module.exports = { saveSession, loadSession, clearSession };
