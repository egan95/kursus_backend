import { Sequelize } from "sequelize";
import db from "../config/Database.js";


const { DataTypes } = Sequelize;

const CourseHistories = db.define('course_histories', {
        level: {
            type: DataTypes.INTEGER
        },
        date: {
            type: DataTypes.DATEONLY
        },
        info: {
            type: DataTypes.TEXT
        },
        photo: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.ENUM('active','finish','not_active')
        }
    },
    {
        freezeTableName: true
    }
)


export default CourseHistories