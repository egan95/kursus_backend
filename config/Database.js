import {Sequelize} from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const db = new Sequelize(`${process.env.db_name}`,`${process.env.db_user}`,`${process.env.db_pass}`,{
//const db = new Sequelize('db_kursus','root','Egan@jaya1',{
    host: "localhost",
    dialect: "mysql",
    operatorsAliases:0,
    timezone:"+08:00",
    dialectOptions: {
        dateStrings: true,
        typeCast: function (field, next) {
            if (field.type === 'DATETIME') {
              return field.string()
            }
            return next()
        },
    }
});

export default db