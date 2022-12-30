const childProcess = require("child_process");
const logger = require("./log");

require("dotenv").config();
// 프로세스 PORK
let taskProcess;
if (process.env.LOCAL_DIRECTORY) {
    taskProcess = childProcess.fork(process.env.LOCAL_DIRECTORY);
} else {
    taskProcess = childProcess.fork(process.env.UBUNTU_DIRECTORY);
}

// taskPorcess에게 업무 전달
taskProcess.on("message", function (m) {
    try {
        const cpuUsage = process.cpuUsage();
        if (m.done === "connect") {
            setTimeout(function () {
                taskProcess.send({ parameter: 1 });
            }, 10000);
            console.log(
                "부모프로세스에서 DB 연결 작업 완료 신호 받았다: ",
                process.cpuUsage(cpuUsage)
            );
            return;
        }
        else if (m.done === "collect") {
            console.log(m);
            setTimeout(function () {
                taskProcess.send({ parameter: m.parameter + 1 });
            }, 10000);
            console.log(
                "부모프로세스에서 수집 작업 완료 신호 받았다: ",
                process.cpuUsage(cpuUsage)
            );
            return;
        }
        else if (m.done === "delete") {
            console.log(m);
            m.parameter = 1
            //  지우고 나면  1시간 대기 후에 시작
            setTimeout(function () {
                taskProcess.send({ parameter: m.parameter });
            }, 3600000);
            console.log(
                "부모프로세스에서 데이터 삭제 작업 완료 신호 받았다: ",
                process.cpuUsage(cpuUsage)
            );
            return;
        }
        else if (m.done === "API expiration") {
            throw new Error("API expiration");
        }
    } catch (error) {
        console.log(error);
        logger.error(err, { message: "-from matchIdTaskMethod(startgetMatchIds)" })
        // 자식, 부모 프로세스 종료
        process.kill(taskProcess.pid);
        process.exit();
    }
});

// db 연결부터 taskProcess 작업 시작
taskProcess.send({ parameter: 0 });
