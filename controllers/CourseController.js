import Courses from "../models/CourseModel.js";

export const getCourses = async (req,res) => {
    try {
        const courses = await Courses.findAll({
            attributes: ['id','name','info','price','createdAt','updatedAt']
        });
        res.json({status:'ok', data:courses});
    } catch (error) {
        console.log('Course Controller error ',error);
    }
}

export const insertCourse = async (req, res) => {
    try {
        const { name, info, price } = req.body;
        const course = await Courses.create({
            name,
            info,
            price
        });
        res.json({status:'ok', data:course, msg : 'Data kursus berhasil ditambahkan'});
    } catch (error) {
        console.log('Course Controller insert error ',error);
    }
}

export const updateCourse = async (req, res) => {
    try {
        const { name, info, price } = req.body;
        const { id } = req.params;
        const course = await Courses.update(
            {
            name,
            info,
            price
        },
        {
            where : {
                id: id
            }
        }
        );
        res.json({status:'ok', msg : 'Data kursus berhasil diupdate'});
    } catch (error) {
        console.log('Course Controller update error ',error);
    }
}

export const deleteCourse = async(req,res) =>  {
    try {
        const { id } = req.params;
        const course = await Courses.destroy(
        {
            where : {
                id: id
            }
        }
        );
        res.json({status:'ok', msg : 'Data kursus berhasil dihapus'});
    } catch (error) {
        console.log('Course Controller delete error ',error);
    }
}