const oracledb = require("oracledb");
require("dotenv").config();

async function getOracle(){

    return await oracledb.getConnection({

        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECT

    });

}

module.exports = {
    getOracle
};