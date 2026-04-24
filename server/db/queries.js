const {pool} = require("./pool")

async function findAllTrips(){
    const {rows} = await pool.query(`SELECT * FROM trips`)
    return rows
}

module.exports={findAllTrips}