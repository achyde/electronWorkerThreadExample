process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')

import {app, BrowserWindow, ipcMain} from 'electron'
import {join} from 'path';

const {Worker} = require('worker_threads')

let win: BrowserWindow | null = null
const url = process.env.VITE_DEV_SERVER_URL as string
const indexHtml = join(process.env.DIST, 'index.html')

let testLog = "";

const log_test_status = (s: string) => {
    win.webContents.send("test_status", s);
    testLog += `${s}\n`;
}

const log_julian_time = (s: string) => win.webContents.send("julian_time", s)
const log_past_messages = () => win.webContents.send("get_log", testLog)

let worker = null;

const terminate_worker = async () => {
    if (worker) {
        await worker.terminate();
        worker = null;
    }
};

const stopTest = async () => {
    log_test_status("Stopping test.");
    await terminate_worker();
};

const runTest = (workerData) => {
    return new Promise((resolve, reject) => {

        worker = new Worker(`${__dirname}/testRunner.js`, {workerData});

        worker.on('message', (e) => {
            if (e.msg) {
                log_test_status(e.msg);
            }
            if (e.julian_time) {
                log_julian_time(e.julian_time);
            }
            if (e.done) {
                stopTest();
            }
        });
        worker.on('close', () => stopTest().then(() => resolve({done: true})));
        worker.on('error', reject);
        worker.on('exit', (code: number) => {
            if (code !== 0){
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
            else{
                resolve({done: true});
            }
        });
    });
}

const createWindow = async () => {

    win = new BrowserWindow({title: 'Main window', webPreferences: {preload: join(__dirname, '../preload/index.js')}});

    if (app.isPackaged) {
        win.loadFile(indexHtml);
    } else {
        win.loadURL(url);
        win.maximize();
    }

    ipcMain.on("clear_log", () => testLog = "");
    ipcMain.on("get_log",  () => log_past_messages());
    ipcMain.on("stop_test", () => stopTest());
    ipcMain.on("start_test", async (event, args) => await runTest({runs: args.runs, steps: args.steps}).catch(()=>log_test_status("Caught return from test"))
        .finally(async () => log_test_status("Test done.")));
};

app.on("ready", createWindow);