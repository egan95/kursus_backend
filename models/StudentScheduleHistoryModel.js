import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const StudentScheduleHistories = db.define('student_schedule_histories', {
        studentId: {
            type: DataTypes.INTEGER
        },
        date_start: {
            type: DataTypes.DATE
        },
        info: {
            type: DataTypes.TEXT
        }
    },
    {
        freezeTableName: true,
    }
)

export default StudentScheduleHistories