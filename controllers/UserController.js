import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {validationResult} from "express-validator"

export const getUsers = async (req,res) => {

    try {
        const users = await Users.findAll({
            attributes: ['id','name','email','createdAt','updatedAt']
        });
        res.json({status:'ok', data:users});
    } catch (error) {
        console.log('User Controller error ',error);
    }
}

export const insertUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({msg:errors.array()});
    }
    try {
        const { name, email, password, confPassword } = req.body;
        if(password!==confPassword) return res.status(400).json({msg:"Password dan konfirmasi password tidak cocok"});
        const salt = await bcrypt.genSalt();
        const hassPassword = await bcrypt.hash(password, salt);
        const user = await Users.create({
            name,
            email,
            password: hassPassword
        });
        res.json({status:'ok', data:user, msg : 'Data user berhasil ditambahkan'});
    } catch (error) {
        console.log('User Controller insert error ',error);
    }
}

export const updateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({msg:errors.array()});
    }
    try {
        const { name, email, password,confPassword } = req.body;
        const { id } = req.params;
        let dataUpdate = {name,email};
        if(password!=='') {
            if(password!==confPassword) return res.status(400).json({msg:"Password dan konfirmasi password tidak cocok"});

            const salt = await bcrypt.genSalt();
            const hassPassword = await bcrypt.hash(password, salt);
            dataUpdate = {
                name,
                email,
                password: hassPassword
            }
        }
        const user = await Users.update(
            dataUpdate,
        {
            where : {
                id: id
            }
        }
        );
        res.json({status:'ok', msg : 'Data user berhasil diupdate'});
    } catch (error) {
        console.log('User Controller update error ',error);
    }
}

export const deleteUser = async(req,res) =>  {
    try {
        const { id } = req.params;
        const course = await Users.destroy(
        {
            where : {
                id: id
            }
        }
        );
        res.json({status:'ok', msg : 'Data user berhasil dihapus'});
    } catch (error) {
        console.log('User Controller delete error ',error);
    }
}

export const checkEmail = async (req,res) => {
    try {
        const users = await Users.findOne({
            attributes: ['id','name','email','createdAt','updatedAt'],
            where: {
                email: req.body.email
            }
        });
        if(users) return res.status(400).json({msg:"Email already registered"});
        res.json({msg:'ok'});
    } catch (error) {
        console.log('User Controller error ',error);
    }
}


export const Register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({msg:errors.array()});
    }
    const { name, email, password, confPassword } = req.body;
    if(password!==confPassword) return res.status(400).json({msg:"Password dan konfirmasi password tidak cocok"});
    const salt = await bcrypt.genSalt();
    const hassPassword = await bcrypt.hash(password, salt);
    try {
        await Users.create({
            name,
            email,
            password:hassPassword
        });
        res.json({msg : "Register berhasil"});
    } catch (error) {
        console.log('error register',error);
    }

}

export const Login = async (req, res) => {

    try {
        const user = await Users.findOne(
            { where: 
                { email: req.body.email } 
            }
        );
        if (user === null) {
            return res.status(404).json({msg:"email tidak ditemukan"});
        } else {
            const match = await bcrypt.compare(req.body.password,user.password);
            if(!match) return res.status(400).json({msg: "Password tidak cocok"});
            const userId = user.id;
            const name = user.name;
            const email = user.email;
            const accessToken = jwt.sign({userId, name, email},process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: '20s'
            });
            const refreshToken = jwt.sign({userId, name, email},process.env.REFRESH_TOKEN_SECRET,{
                expiresIn: '1d'
            });

            await Users.update({refresh_token:refreshToken},{
                where: {
                    id:userId
                }
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            })
            res.json({token:accessToken});
        }
    } catch (error) {
        console.log('error login',error);
    }
}

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where: {
            refresh_token: refreshToken
        }
    });
    if(!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update({refresh_token:''},{
        where : {id:userId}
    });
    res.clearCookie('refreshToken');
    res.sendStatus(200);
}
