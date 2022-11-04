var import_electron = require("electron");
var import_path = require("path");
var import_worker_threads = require("worker_threads");
process.env.DIST_ELECTRON = (0, import_path.join)(__dirname, "..");
process.env.DIST = (0, import_path.join)(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = import_electron.app.isPackaged ? process.env.DIST : (0, import_path.join)(process.env.DIST_ELECTRON, "../public");
let win = null;
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = (0, import_path.join)(process.env.DIST, "index.html");
let testLog = "";
const log_test_status = (s) => {
  win.webContents.send("test_status", s);
  testLog += `${s}
`;
};
const log_julian_time = (s) => win.webContents.send("julian_time", s);
const log_past_messages = () => win.webContents.send("get_log", testLog);
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
    worker = new import_worker_threads.Worker(`${__dirname}/testRunner.js`, { workerData });
    worker.on("message", (e) => {
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
    worker.on("close", () => stopTest().then(() => resolve({ done: true })));
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      } else {
        resolve({ done: true });
      }
    });
  });
};
const createWindow = async () => {
  win = new import_electron.BrowserWindow({ title: "Main window", webPreferences: { preload: (0, import_path.join)(__dirname, "../preload/index.js") } });
  if (import_electron.app.isPackaged) {
    win.loadFile(indexHtml);
  } else {
    win.loadURL(url);
    win.maximize();
  }
  import_electron.ipcMain.on("clear_log", () => testLog = "");
  import_electron.ipcMain.on("get_log", () => log_past_messages());
  import_electron.ipcMain.on("stop_test", () => stopTest());
  import_electron.ipcMain.on("start_test", async (event, args) => await runTest({ runs: args.runs, steps: args.steps }).catch(() => log_test_status("Caught return from test")).finally(async () => log_test_status("Test done.")));
};
import_electron.app.on("ready", createWindow);

//# sourceMappingURL=index.js.map