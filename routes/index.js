import express  from "express";
import { getUsers, insertUser, updateUser, deleteUser, checkEmail, Login, Register, Logout } from "../controllers/UserController.js";
import { getCourses, insertCourse, updateCourse, deleteCourse} from "../controllers/CourseController.js";
import {deleteStudent, deleteStudentCourseHistory, getStudentAbsen, getStudentById, getStudentCourseHistories, getStudents, getStudentSchedule, insertStudent, insertStudentCourseHistory, setSchedule, updateStudent, updateStudentCourseHistory} from "../controllers/StudentController.js"
import { deleteTeacher, getTeachers, insertTeacher, updateTeacher } from "../controllers/TeacherController.js";
import { verifytoken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshTokenController.js";
import multer from "multer";
import path from "path"

import {body} from "express-validator"
import Users from "../models/UserModel.js";

const router = express.Router();


// route for user
router.get('/users',verifytoken, getUsers);
router.post('/users', [
    body('email').custom(async (value) => {
        let emailDuplikat = await Users.findOne({where:{email:value}})
        if(emailDuplikat) {
            throw new Error('Email already registered');
        }
        return true
    })],verifytoken, insertUser);
router.put('/users/:id', [
    body('email').custom(async (value, {req}) => {
        if(req.body.oldEmail!==value) {
            const emailDuplikat = await Users.findOne({where:{email:value}})
            if(emailDuplikat) {
                throw new Error('Email already registered');
            }
        }
        return true
    })],verifytoken, updateUser);

router.delete('/users/:id',verifytoken, deleteUser);

router.post('/check-email', checkEmail);
router.post('/register', [
    body('email').custom(async (value) => {
        const emailDuplikat = await Users.findOne({where:{email:value}})
        if(emailDuplikat) {
            throw new Error('Email already registered');
        }
        return true
    })], Register);
router.post('/login', Login);
router.get('/token', refreshToken);
router.get('/logout', Logout);

// route kursus
router.get('/kursus',verifytoken, getCourses);
router.post('/kursus',verifytoken, insertCourse);
router.put('/kursus/:id',verifytoken, updateCourse);
router.delete('/kursus/:id',verifytoken, deleteCourse);

// route for students
const diskStorageStudent = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'student' + '-' + uniqueSuffix + path.extname(file.originalname))
      }
  });
router.get('/students', verifytoken, getStudents);
router.get('/student/:id', verifytoken, getStudentById);
router.post('/students', multer({ storage: diskStorageStudent }).single('image'),verifytoken, insertStudent);
router.put('/student/:id', multer({ storage: diskStorageStudent }).single('image'),verifytoken, updateStudent);
router.delete('/students/:id', verifytoken, deleteStudent);

const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'kursus' + '-' + uniqueSuffix + path.extname(file.originalname))
      }
  });

router.get('/student/course-histories/:id', verifytoken, getStudentCourseHistories);
router.post('/student/course-history', multer({ storage: diskStorage }).single('image'), verifytoken, insertStudentCourseHistory);
router.put('/student/course-history/:id', multer({ storage: diskStorage }).single('image'),verifytoken, updateStudentCourseHistory);
router.delete('/student/course-history/:id', verifytoken, deleteStudentCourseHistory);

// route student schedule
router.post('/student/schedule', verifytoken, getStudentSchedule);
router.post('/student/set-schedule', verifytoken, setSchedule);

//route student absensi
router.post('/student/absensi', verifytoken, getStudentAbsen);

// route teacher
router.get('/teachers',verifytoken, getTeachers);
router.post('/teacher',verifytoken, insertTeacher);
router.put('/teacher/:id',verifytoken, updateTeacher);
router.delete('/teacher/:id',verifytoken, deleteTeacher);

export default router;