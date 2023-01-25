const { dataSource } = require("../../orm")
const combination = dataSource.getRepository("combination")
const simulation = dataSource.getRepository("simulation")
const simulation_service = dataSource.getRepository("simulation_service")
const winRate = dataSource.getRepository("champ_win_rate")
const banRate = dataSource.getRepository("champban")
const position = dataSource.getRepository("champ_position")
const spell = dataSource.getRepository("champspell")
const spell_service = dataSource.getRepository("champspell_service")
const champ_service = dataSource.getRepository("champ_service")
const matchId = dataSource.getRepository("matchid")
const PuuId = dataSource.getRepository("puuid")
const SummonerId = dataSource.getRepository('summonerid')

const { dataSource_service } = require("../../service.orm")
const combination_stat = dataSource_service.getRepository("COMBINATION_STAT")

exports.findVersion_combination = async () => {
    return await combination
        .createQueryBuilder()
        .select(["DISTINCT combination.version"])
        .getRawMany()
}

exports.deleteOutdatedData_combination = async (version) => {
    try {
        // console.log(version)
        await combination
            .createQueryBuilder()
            .delete()
            .where("combination.version = :version", { version })
            .execute()
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_simulation = async () => {
    return await simulation
        .createQueryBuilder()
        .select(["DISTINCT simulation.version"])
        .getRawMany()
}

exports.deleteOutdatedData_simulation = async (version) => {
    try {
        // console.log(version)
        await simulation
            .createQueryBuilder()
            .delete()
            .where("simulation.version = :version", { version })
            .execute()
        await simulation_service
            .createQueryBuilder()
            .delete()
            .where("simulation_service.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_winRate = async () => {
    return await winRate.createQueryBuilder("win").select(["DISTINCT win.version"]).getRawMany()
}
exports.deleteOutdatedData_winRate = async (version) => {
    try {
        // console.log(version)
        await winRate
            .createQueryBuilder()
            .delete()
            .where("champ_win_rate.version = :version", { version })
            .execute()
        await champ_service
            .createQueryBuilder()
            .delete()
            .where("champ_service.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_banRate = async () => {
    return await banRate.createQueryBuilder("ban").select(["DISTINCT ban.version"]).getRawMany()
}
exports.deleteOutdatedData_banRate = async (version) => {
    try {
        // console.log(version)
        await banRate
            .createQueryBuilder()
            .delete()
            .where("champban.version = :version", { version })
            .execute()
        await champ_service
            .createQueryBuilder()
            .delete()
            .where("champ_service.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_position = async () => {
    return await position
        .createQueryBuilder("position")
        .select(["DISTINCT position.version"])
        .getRawMany()
}
exports.deleteOutdatedData_position = async (version) => {
    try {
        // console.log(version)
        await position
            .createQueryBuilder()
            .delete()
            .where("champ_position.version = :version", { version })
            .execute()
        await champ_service
            .createQueryBuilder("champ")
            .delete()
            .where("champ_service.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_spell = async () => {
    return await spell.createQueryBuilder("spell").select(["DISTINCT spell.version"]).getRawMany()
}
exports.deleteOutdatedData_spell = async (version) => {
    try {
        // console.log(version)
        await spell
            .createQueryBuilder()
            .delete()
            .where("champspell.version = :version", { version })
            .execute()
        await spell_service
            .createQueryBuilder("spell_service")
            .delete()
            .where("champspell_service.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_matchId = async () => {
    return await matchId.createQueryBuilder().select(["DISTINCT matchid.version"]).getRawMany()
}

exports.deleteOutdatedData_matchId = async (version) => {
    try {
        // console.log(version)
        await matchId
            .createQueryBuilder()
            .delete()
            .where("matchid.version = :version", { version })
            // .andWhere('matchid.simulationAnalyzed = :simulationAnalyzed', { simulationAnalyzed: 1 })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

// WrongMatchId 삭제 관련
exports.findWrongMatchId = async () => {
    try {
        return await matchId
            .createQueryBuilder()
            .select()
            .where("matchid.analyzed = :analyzed", { analyzed: 2 })
            .andWhere("matchid.rateAnalyzed = :rateAnalyzed", { rateAnalyzed: 2 })
            .andWhere("matchid.banAnalyzed = :banAnalyzed", { banAnalyzed: 2 })
            .andWhere("matchid.positionAnalyzed = :positionAnalyzed", { positionAnalyzed: 2 })
            .andWhere("matchid.spellAnalyzed = :spellAnalyzed", { spellAnalyzed: 2 })
            // .andWhere('matchid.simulationAnalyzed = :simulationAnalyzed', { simulationAnalyzed: 2 })
            .getMany()
    } catch (err) {
        console.log(err)
    }
}

exports.findWrongPuuId = async () => {
    try {
        return await PuuId
            .createQueryBuilder()
            .select()
            .where("puuid.analyzed = :analyzed", { analyzed: 2 })
            .getMany()
    } catch (err) {
        console.log(err)
    }
}

exports.findWrongSummonerId = async () => {
    try {
        return await SummonerId
            .createQueryBuilder()
            .select()
            .where("summonerid.analyzed = :analyzed", { analyzed: 2 })
            .getMany()
    } catch (err) {
        console.log(err)
    }
}

exports.deleteWrongMatchId = async () => {
    try {
        await matchId
            .createQueryBuilder()
            .delete()
            .where("matchid.analyzed = :analyzed", { analyzed: 2 })
            .andWhere("matchid.rateAnalyzed = :rateAnalyzed", { rateAnalyzed: 2 })
            .andWhere("matchid.banAnalyzed = :banAnalyzed", { banAnalyzed: 2 })
            .andWhere("matchid.positionAnalyzed = :positionAnalyzed", { positionAnalyzed: 2 })
            .andWhere("matchid.spellAnalyzed = :spellAnalyzed", { spellAnalyzed: 2 })
            // .andWhere('matchid.simulationAnalyzed = :simulationAnalyzed', { simulationAnalyzed: 2 })
            .execute()
    } catch (err) {
        console.log(err)
        logger.error(err, { message: "-from WrongMatchId 삭제 쿼리" })
    }
}

exports.deleteWrongPuuId = async () => {
    try {
        await PuuId
            .createQueryBuilder()
            .delete()
            .where('puuid.analyzed = :analyzed', { analyzed: 2 })
            .execute()
    } catch (err) {
        console.log(err)
        return
    }
}

exports.deleteWrongSummonerId = async () => {
    try {
        await SummonerId
            .createQueryBuilder()
            .delete()
            .where('summonerid.analyzed = :analyzed', { analyzed: 2 })
            .execute()
    } catch (err) {
        console.log(err)
        return
    }
}

exports.findDoneMatchId = async () => {
    try {
        return await matchId.createQueryBuilder().select(['matchid.matchId'])
            .where("matchid.analyzed != :analyzed", { analyzed: 0 })
            .andWhere("matchid.rateAnalyzed != :rateAnalyzed", { rateAnalyzed: 0 })
            .andWhere("matchid.banAnalyzed != :banAnalyzed", { banAnalyzed: 0 })
            .andWhere("matchid.positionAnalyzed != :positionAnalyzed", { positionAnalyzed: 0 })
            .andWhere("matchid.spellAnalyzed != :spellAnalyzed", { spellAnalyzed: 0 })
            .getMany()
    } catch (err) {
        console.log(err)
        return
    }
}
exports.deleteDoneMatchId = async () => {
    try {
        await matchId.
            createQueryBuilder()
            .delete()
            .where("matchid.analyzed != :analyzed", { analyzed: 0 })
            .andWhere("matchid.rateAnalyzed != :rateAnalyzed", { rateAnalyzed: 0 })
            .andWhere("matchid.banAnalyzed != :banAnalyzed", { banAnalyzed: 0 })
            .andWhere("matchid.positionAnalyzed != :positionAnalyzed", { positionAnalyzed: 0 })
            .andWhere("matchid.spellAnalyzed != :spellAnalyzed", { spellAnalyzed: 0 })
            // .andWhere('matchid.simulationAnalyzed = :simulationAnalyzed', { simulationAnalyzed: 2 })
            .execute()
    } catch (err) {
        console.log(err)
        return
    }
}

exports.getMainpageData_analysisDB = async (version) => {
    try {
        const category0 =
            await combination.createQueryBuilder()
                .select()
                .where('combination.category = :category', { category: 0 })
                .andWhere('combination.version = :version', { version })
                .orderBy({ '(combination.sampleNum) * 0.3 + (combination.win/combination.sampleNum) * 100 * 0.7': 'DESC' })
                .limit(30)
                .getMany()
        const category1 =
            await combination.createQueryBuilder()
                .select()
                .where('combination.category = :category', { category: 1 })
                .andWhere('combination.version = :version', { version })
                .orderBy({ '(combination.sampleNum) * 0.3 + (combination.win/combination.sampleNum) * 100 * 0.7': 'DESC' })
                .limit(30)
                .getMany()

        const category2 =
            await combination.createQueryBuilder()
                .select()
                .where('combination.category = :category', { category: 2 })
                .andWhere('combination.version = :version', { version })
                .orderBy({ '(combination.sampleNum) * 0.3 + (combination.win/combination.sampleNum) * 100 * 0.7': 'DESC' })
                .limit(30)
                .getMany()
        return { category0: category0.length, category1: category1.length, category2: category2.length }
    } catch (err) {
        console.log(err)
        return
    }
}

exports.getMainpageData_serviceDB = async (version) => {
    try {
        const category0 =
            await combination_stat.createQueryBuilder()
                .select()
                .where('COMBINATION_STAT.category = :category', { category: 0 })
                .andWhere('COMBINATION_STAT.version = :version', { version })
                .andWhere('COMBINATION_STAT.sample_num >= :sampleNum', { sampleNum: 30 })
                .orderBy({ '((COMBINATION_STAT.win/COMBINATION_STAT.sample_num) * 0.4 + ((COMBINATION_STAT.sample_num - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) / ((SELECT MAX(sample_num) FROM COMBINATION_STAT) - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) * 0.6 )) * 5': 'DESC' })
                .getCount()
        const category1 =
            await combination_stat.createQueryBuilder()
                .select()
                .where('COMBINATION_STAT.category = :category', { category: 1 })
                .andWhere('COMBINATION_STAT.version = :version', { version })
                .andWhere('COMBINATION_STAT.sample_num >= :sampleNum', { sampleNum: 30 })
                .orderBy({ '((COMBINATION_STAT.win/COMBINATION_STAT.sample_num) * 0.4 + ((COMBINATION_STAT.sample_num - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) / ((SELECT MAX(sample_num) FROM COMBINATION_STAT) - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) * 0.6 )) * 5': 'DESC' })
                .getCount()

        const category2 =
            await combination_stat.createQueryBuilder()
                .select()
                .where('COMBINATION_STAT.category = :category', { category: 2 })
                .andWhere('COMBINATION_STAT.version = :version', { version })
                .andWhere('COMBINATION_STAT.sample_num >= :sampleNum', { sampleNum: 30 })
                .orderBy({ '((COMBINATION_STAT.win/COMBINATION_STAT.sample_num) * 0.4 + ((COMBINATION_STAT.sample_num - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) / ((SELECT MAX(sample_num) FROM COMBINATION_STAT) - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) * 0.6 )) * 5': 'DESC' })
                .getCount()
        return { category0: category0, category1: category1, category2: category2 }
    } catch (err) {
        console.log(err)
        return
    }
}