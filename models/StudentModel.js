import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Students = db.define('students', {
        name: {
            type: DataTypes.STRING
        },
        nickname: {
            type: DataTypes.STRING
        },
        gender: {
            type: DataTypes.ENUM('m','f')
        },
        dob: {
            type: DataTypes.DATEONLY
        },
        place_birth: {
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.TEXT
        },
        parent: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING(15)
        },
        join_date: {
            type: DataTypes.DATEONLY
        },
        photo: {
            type: DataTypes.STRING
        },
        info: {
            type: DataTypes.TEXT
        },
    },
    {
        freezeTableName: true
    }
)

export default Students