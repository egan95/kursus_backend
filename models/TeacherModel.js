import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Teachers = db.define('teachers', {
        name: {
            type: DataTypes.STRING
        },
        nickname: {
            type: DataTypes.STRING
        },
        gender: {
            type: DataTypes.ENUM('m','f')
        },
        address: {
            type: DataTypes.TEXT
        },
        phone: {
            type: DataTypes.STRING(15)
        },
        join_date: {
            type: DataTypes.DATEONLY
        },
        info: {
            type: DataTypes.TEXT
        },
    },
    {
        freezeTableName: true
    }
)

export default Teachers