const { dataSource } = require('../../orm')
const combination = dataSource.getRepository('combination')
const combination_service = dataSource.getRepository('combination_service')
const simulation = dataSource.getRepository('simulation')
const simulation_service = dataSource.getRepository('simulation_service')

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