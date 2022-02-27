import Teachers from "../models/TeacherModel.js";

export const getTeachers = async (req,res) => {
    try {
        const teachers = await Teachers.findAll();
        res.json({status:'ok', data:teachers});
    } catch (error) {
        console.log('Teachers Controller error ',error);
    }
}

export const insertTeacher = async (req, res) => {
    try {
        const { name,nickname, gender, phone, address, join_date, info } = req.body;
        const teacher = await Teachers.create({
            name,
            nickname,
            gender,
            phone,
            address,
            join_date,
            info
        });
        res.json({status:'ok', data:teacher, msg : 'Data teacher berhasil ditambahkan'});
    } catch (error) {
        console.log('Teacher Controller insert error ',error);
    }
}

export const updateTeacher = async (req, res) => {
    try {
        const { name,nickname, gender, phone, address, join_date, info } = req.body;
        const { id } = req.params;
        const teacher = await Teachers.update(
            {
            name,
            nickname,
            gender,
            phone,
            address,
            join_date,
            info
        },
        {
            where : {
                id: id
            }
        }
        );
        res.json({status:'ok', msg : 'Data guru berhasil diupdate'});
    } catch (error) {
        console.log('Teacher Controller update error ',error);
    }
}

export const deleteTeacher = async(req,res) =>  {
    try {
        const { id } = req.params;
        const teacher = await Teachers.destroy(
        {
            where : {
                id: id
            }
        }
        );
        res.json({status:'ok', msg : 'Data guru berhasil dihapus'});
    } catch (error) {
        console.log('Teacher Controller delete error ',error);
    }
}