import {parentPort, workerData} from "worker_threads";

const log_test_status = (val: string) => parentPort.postMessage({msg: val});
const log_julian_time = (val: string) => parentPort.postMessage({julian_time: val});

const runTest = async (runs: number, steps: number) => {

    const sleep = (amount: number) => new Promise((resolve) => setTimeout(resolve, amount));

    const timeBetweenStepsSeconds = 10;
    const startDelaySec = 5;
    const secondsToWaitForTest = (timeBetweenStepsSeconds * steps) + startDelaySec;

    const getJulianTime = () => ((new Date().getTime() / 86400000) + 2440587.5).toFixed(5);

    log_test_status(`Start test session`);
    log_test_status(`${getJulianTime()}`);

    setInterval(() => log_julian_time(getJulianTime()), 250);

    for (let i = 0; i < runs; i++) {

        log_test_status(`Running test ${i + 1}`);

        await Promise.resolve(log_test_status("Start of async work"))
            .then(() => log_test_status(`sleep(2000)`))
            .then(() => sleep(2000))
            .then(() => log_test_status(JSON.stringify({success:true})))
            .then(() => log_test_status(`Waiting ${secondsToWaitForTest} seconds for test ${i + 1} to finish`))
            .then(() => sleep(secondsToWaitForTest * 1000))
            .then(() => log_test_status(`Finished test ${i + 1}`))
    }
    log_test_status(`End test session`);
}

runTest(workerData.runs, workerData.steps).then(() => parentPort.close());
