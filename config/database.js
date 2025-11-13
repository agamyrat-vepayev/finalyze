import { Sequelize } from "sequelize";
import config from "./config.js";

const sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    {
        host: config.db.server,
        dialect: config.db.dialect,
        dialectOptions: config.db.dialectOptions,
        logging: false
    }
)

export default sequelize