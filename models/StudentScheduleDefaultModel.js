import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const StudentScheduleDefaults = db.define('student_schedule_defaults', {
        studentScheduleHistoryId: {
            type: DataTypes.INTEGER
        },
        day: {
            type: DataTypes.STRING(10)
        },
        start_time: {
            type: DataTypes.TIME
        },
        end_time: {
            type: DataTypes.TIME
        }
    },
    {
        freezeTableName: true,
    }
)

export default StudentScheduleDefaults