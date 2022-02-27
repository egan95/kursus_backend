import { Sequelize } from "sequelize";
import db from "../config/Database.js";


const { DataTypes } = Sequelize;

const Courses = db.define('courses', {
        name: {
            type: DataTypes.STRING
        },
        info: {
            type: DataTypes.TEXT
        },
        price: {
            type: DataTypes.DECIMAL(10,0)
        },
    },
    {
        freezeTableName: true
    }
)


export default Courses