const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');

let serverProcess;

function startServer() {
    const serverPath = __dirname;


    if (!fs.existsSync(path.join(serverPath, 'node_modules'))) {
        console.log('Installing server dependencies...');
        execSync('npm install', { cwd: serverPath, stdio: 'inherit' });
    }

    // start server
    serverProcess = spawn('node', ['server.js'], {
        cwd: serverPath,
        shell: true,
        stdio: 'inherit'
    });

    serverProcess.on('error', (err) => console.error('Server failed to start', err));
    serverProcess.on('exit', (code) => console.log('Server exited with code', code));
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadURL('http://localhost:3000'); // point to your server
}

app.whenReady().then(() => {
    startServer();
    createWindow();
});

app.on('will-quit', () => {
    if (serverProcess) serverProcess.kill();
});