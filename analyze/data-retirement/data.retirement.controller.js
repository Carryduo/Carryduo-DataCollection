const { findVersion, deleteOutdatedData } = require("./data.retirement.service")


exports.deleteOutdataedData = async () => {
    try {
        // 테이블에 존재하는 모든 패치버전 조회
        const data = await findVersion()

        // 패치버전 최신순으로 sort 위해 소수 자리만 남기기
        let versionList = []
        for (const versionKey of data) {
            let version = versionKey.version
            // 패치버전이 12.x.인 경우, 마지막 . 제거
            if (version[version.length - 1] === '.') {
                version = version.slice(0, -1)
            }
            // 최신 버전 sort를 위해 소수점 이하만 남기기
            version = version.split('.')[1]
            // version = old는 제외
            if (!isNaN(Number(version))) {
                versionList.push(Number(version))
            }
        }
        // 최신 버전에 따라 오름차순
        versionList = versionList.sort((a, b) => { return b - a })

        // 최신 3개 버전 제외하고 삭제하는 로직
        for (let i = 3; i < versionList.length; i++) {
            let version = versionList[i]
            //  기존 DB 데이터 형식에 맞추기  EX) 17 -> 12.17, 7 -> 12.7.
            if (versionList[i] < 10) {
                version = `12.${version}.`
            } else {
                version = `12.${version}`
            }
            await deleteOutdatedData(version)
            console.log(`패치버전 ${version} 데이터 제거 완료`)
        }
    } catch (err) {
        console.log(err)
    }
}