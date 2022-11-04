var import_worker_threads = require("worker_threads");
const log_test_status = (val) => import_worker_threads.parentPort.postMessage({ msg: val });
const log_julian_time = (val) => import_worker_threads.parentPort.postMessage({ julian_time: val });
const runTest = async (runs, steps) => {
  const sleep = (amount) => new Promise((resolve) => setTimeout(resolve, amount));
  const timeBetweenStepsSeconds = 10;
  const startDelaySec = 5;
  const secondsToWaitForTest = timeBetweenStepsSeconds * steps + startDelaySec;
  const getJulianTime = () => (new Date().getTime() / 864e5 + 24405875e-1).toFixed(5);
  log_test_status(`Start test session`);
  log_test_status(`${getJulianTime()}`);
  setInterval(() => log_julian_time(getJulianTime()), 250);
  for (let i = 0; i < runs; i++) {
    log_test_status(`Running test ${i + 1}`);
    await Promise.resolve(log_test_status("Start of async work")).then(() => log_test_status(`sleep(2000)`)).then(() => sleep(2e3)).then(() => log_test_status(JSON.stringify({ success: true }))).then(() => log_test_status(`Waiting ${secondsToWaitForTest} seconds for test ${i + 1} to finish`)).then(() => sleep(secondsToWaitForTest * 1e3)).then(() => log_test_status(`Finished test ${i + 1}`));
  }
  log_test_status(`End test session`);
  import_worker_threads.parentPort.postMessage({ done: true });
};
runTest(import_worker_threads.workerData.runs, import_worker_threads.workerData.steps).then(() => import_worker_threads.parentPort.close());

//# sourceMappingURL=testRunner.js.map