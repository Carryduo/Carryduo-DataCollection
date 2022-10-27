const { dataSource } = require('../../orm')
const combination = dataSource.getRepository('combination')
const combination_service = dataSource.getRepository('combination_service')
const simulation = dataSource.getRepository('simulation')
exports.findVersion = async () => {
    return await combination.createQueryBuilder().select(['DISTINCT combination.version']).getRawMany()
}

exports.findData = async (version) => {
    return await simulation.createQueryBuilder().select().where("simulation.version = :version", { version }).getMany()
}

exports.deleteOutdatedData = async (version) => {
    try {
        console.log(version)
        await combination.createQueryBuilder().delete().where('combination.version = :version', { version }).execute()
        await combination_service.createQueryBuilder().delete().where('combination_service.version = :version', { version }).execute()
        return
    } catch (err) {
        console.log(err)
    }
}