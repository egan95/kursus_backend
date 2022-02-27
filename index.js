import express from "express";
import db from "./config/Database.js";
import router from "./routes/index.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"

dotenv.config();

try {
    await db.authenticate();
    console.log("database connected")
} catch (error) {
    console.log("error connection : "+error)
}

const app = express();
const port = 3031;

app.use(cors({credentials:true, origin:'http://localhost:3000'}))
app.use(cookieParser());
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(router);


app.listen(port, ()=> console.log('server running with link : http://localhost:'+port));
