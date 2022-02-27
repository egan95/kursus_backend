import { Sequelize } from "sequelize";
import db from "../config/Database.js";


const { DataTypes } = Sequelize;

const Courses = db.define('schedules', {
        studentId: {
            type: DataTypes.INTEGER
        },
        date: {
            type: DataTypes.DATE
        },
        start_time: {
            type: DataTypes.TIME
        },
        end_time: {
            type: DataTypes.TIME
        },
        info: {
            type: DataTypes.TEXT
        },
    },
    {
        freezeTableName: true
    }
)


export default Courses