const { dataSource } = require("../../orm")
const PuuId = dataSource.getRepository("puuid")
const MatchId = dataSource.getRepository("matchid")
const queryRunner = dataSource.createQueryRunner()
const matchid = require("../../entity/match.id")
const puuId = require("../../entity/puuid")
const MatchData = dataSource.getRepository("matchdata")
const { Brackets } = require("typeorm")

exports.findPuuId = async (offsetOption) => {
    return await PuuId.createQueryBuilder()
        .select(["puuid.tier", "puuid.summonerId", "puuid.division", "puuid.puuid"])
        .orderBy("puuid.createdAt", "DESC")
        .limit(500)
        .offset(offsetOption)
        .getMany()
}
exports.saveMatchId = async (matchId, tier, division, summonerId, puuid) => {
    await queryRunner.connect()
    await queryRunner.startTransaction()
    let data
    let dbupdate
    try {
        data = await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(matchid)
            .values({
                matchId,
                tier,
                division,
                summonerId,
                puuid,
            })
            .execute()
            .then(() => {
                return { code: 200, message: "정상" }
            })

        await queryRunner.manager
            .createQueryBuilder()
            .update(puuId)
            .set({ analyzed: 1 })
            .where("puuid.puuid = :puuid", { puuid })
            .execute()
            .then(() => {
                dbupdate = { message: `${puuid} 분석 성공` }
            })
        await queryRunner.commitTransaction()
    } catch (error) {
        if (error.errno === 1062) {
            data = { code: 1062, message: "중복값 에러" }
        }
        dbupdate = { message: `${puuid} 분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        return { data, dbupdate }
    }
}

exports.disconnect = async () => {
    await queryRunner.release()
}

exports.updateWrongPuuId = async (puuid) => {
    await PuuId.createQueryBuilder()
        .update()
        .set({ analyzed: 2 })
        .where("puuid.puuid = :puuid", { puuid })
        .execute()
        .then(() => {
            console.log(`분석 오류 puuId 처리 ${puuid}`)
        })
}

exports.getTodayMatchDataCount = async () => {
    return await MatchId.createQueryBuilder()
        .select("COUNT(*) today_matchid_count")
        .where("DATE(createdAt) = CURDATE()")
        .getRawOne()
}
