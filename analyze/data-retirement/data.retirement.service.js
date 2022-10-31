const logger = require('../../log')
const { dataSource } = require('../../orm')
const combination = dataSource.getRepository('combination')
const combination_service = dataSource.getRepository('combination_service')
const simulation = dataSource.getRepository('simulation')
const simulation_service = dataSource.getRepository('simulation_service')
const matchId = dataSource.getRepository('matchid')

const { performance } = require("perf_hooks");
// Data 삭제 관련
exports.findVersion_combination = async () => {
    return await combination.createQueryBuilder().select(['DISTINCT combination.version']).getRawMany()
}

exports.deleteOutdatedData_combination = async (version) => {
    try {
        console.log(version)
        await combination.createQueryBuilder().delete().where('combination.version = :version', { version }).execute()
        await combination_service.createQueryBuilder().delete().where('combination_service.version = :version', { version }).execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_simulation = async () => {
    return await simulation.createQueryBuilder().select(['DISTINCT simulation.version']).getRawMany()
}

exports.deleteOutdatedData_simulation = async (version) => {
    try {
        console.log(version)
        await simulation.createQueryBuilder().delete().where('simulation.version = :version', { version }).execute()
        await simulation_service.createQueryBuilder().delete().where('simulation_service.version = :version', { version }).execute()
        return
    } catch (err) {
        console.log(err)
    }
}

// WrongMatchId 삭제 관련

exports.findWrongMatchId = async () => {
    try {
        return await matchId.createQueryBuilder().select()
            .where('matchid.analyzed = :analyzed', { analyzed: 2 })
            .andWhere('matchid.rateAnalyzed = :rateAnalyzed', { rateAnalyzed: 2 })
            .andWhere('matchid.banAnalyzed = :banAnalyzed', { banAnalyzed: 2 })
            .andWhere('matchid.positionAnalyzed = :positionAnalyzed', { positionAnalyzed: 2 })
            .andWhere('matchid.spellAnalyzed = :spellAnalyzed', { spellAnalyzed: 2 })
            .andWhere('matchid.simulationAnalyzed = :simulationAnalyzed', { simulationAnalyzed: 2 })
            .getMany()
    } catch (err) {
        console.log(err)
    }
}

exports.deleteWrongMatchId = async () => {
    try {
        await matchId.createQueryBuilder().delete()
            .andWhere('matchid.rateAnalyzed = :rateAnalyzed', { rateAnalyzed: 2 })
            .andWhere('matchid.banAnalyzed = :banAnalyzed', { banAnalyzed: 2 })
            .andWhere('matchid.positionAnalyzed = :positionAnalyzed', { positionAnalyzed: 2 })
            .andWhere('matchid.spellAnalyzed = :spellAnalyzed', { spellAnalyzed: 2 })
            .andWhere('matchid.simulationAnalyzed = :simulationAnalyzed', { simulationAnalyzed: 2 })
            .execute()
    } catch (err) {
        console.log(err)
        logger.error(err, { message: '-from WrongMatchId 삭제 쿼리' })
    }
}

// outdatedMatchId 삭제 관련

exports.findOutdatedMatchId = async () => {
    try {
        const nowDate = performance.now()
        console.log(nowDate)
        // return await matchId.createQueryBuilder().where('match')
    } catch (err) {
        console.log(err)
        logger.error(err, { message: '-from outdatedMatchId 조회 쿼리' })
    }
}