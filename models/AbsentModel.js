import { Sequelize } from "sequelize";
import db from "../config/Database.js";


const { DataTypes } = Sequelize;

const Absents = db.define('absents', {
        studentId: {
            type: DataTypes.INTEGER
        },
        course_historyId: {
            type: DataTypes.INTEGER
        },
        teacherId: {
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


export default Absents