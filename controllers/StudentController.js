import Students from "../models/StudentModel.js";
import CourseHistories from "../models/CourseHistoriesModel.js";
import Courses from "../models/CourseModel.js";
import StudentScheduleDefaults from "../models/StudentScheduleDefaultModel.js";
import StudentScheduleHistories from "../models/StudentScheduleHistoryModel.js";
import Schedule from "../models/ScheduleModel.js";
import {validationResult} from "express-validator"
import multer from "multer";
import moment from "moment";
import fs from "fs";
import {Op} from "sequelize"

Students.hasMany(CourseHistories)
CourseHistories.belongsTo(Courses)
Students.hasMany(StudentScheduleHistories)
StudentScheduleHistories.hasMany(StudentScheduleDefaults)
Students.hasMany(Schedule)
// StudentScheduleDefaults.removeAttribute('id')

export const getStudents = async (req,res) => {
    try {
        const students = await Students.findAll({
            include: [{
                model:CourseHistories,
                attributes:{exclude:['id']},
                order:[['date', 'desc']],
                include: {
                    model:Courses
                }

            }],
            order:[
                ['join_date', 'desc'],
                [{model:CourseHistories},'date','desc']
            ],
            // order:[
            //     [ {model: CourseHistories}, 'date', 'desc'  ],
            // ]
        });
        res.json({status:'ok', data:students});
    } catch (error) {
        console.log('Students Controller error ',error);
    }
}

export const getStudentById = async (req,res) => {
    try {
        const id = req.params.id
        const student = await Students.findOne({
            include: {
                model:StudentScheduleHistories,
                include: {
                    model:StudentScheduleDefaults
                }
            },
            where: {
                id
            },
            order:[
                [{model:StudentScheduleHistories},'date_start','desc']
            ],
        });
        // const studentScheduleDef = await StudentScheduleDefaults.findAll({
        //     where: {
        //         studentId:id
        //     }
        // });
        
        // var newStudent = {...student.dataValues, scheduleDef:studentScheduleDef}
        res.json({status:'ok', data:student});
    } catch (error) {
        console.log('Student Controller error ',error);
    }
}

export const insertStudent = async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({msg:errors.array()});
    // }
    try {
        const request = req.body;
        const file = req.file;
        const checkDay = JSON.parse(request.checkDay);
        // console.log(request);
        // console.log(JSON.parse(request.checkDay))

        let dataToInsert = {
            name: request.name,
            nickname: request.nickname,
            gender: request.gender,
            dob: (request.dob==='null' || request.dob==='') ? null: moment(request.dob).format('YYYY-MM-DD'),
            place_birth: request.place_birth,
            address: request.address,
            parent: request.parent,
            phone: request.phone,
            join_date: moment(request.join_date).format('YYYY-MM-DD'),
            info: request.info,
        }
        if(file) {
            dataToInsert.photo= file.filename;
        }
        const student = await Students.create(dataToInsert);

        if(student) {
            const scheduleHistory = await StudentScheduleHistories.create({
                studentId:student.id,
                date_start:moment(request.join_date).format('YYYY-MM-DD'),
                info:'on created'
            })
            const scheduleHistoryId = scheduleHistory.id

            checkDay.forEach(async element => {
                await StudentScheduleDefaults.create({
                    studentScheduleHistoryId:scheduleHistoryId,
                    day:element.day,
                    start_time:moment(element.start_time).format('HH:mm:ss'),
                    end_time:moment(element.end_time).format('HH:mm:ss'),
                })
            });
        }

        if(student && request.isInsertKursus=='true') {
            //insert data schedule default

            //insert data kursus
            await CourseHistories.create({
                studentId : student.id,
                courseId: request.courseId,
                level: request.courseLevel,
                date: moment(request.courseDate).format('YYYY-MM-DD'),
                info: request.courseInfo,
                photo: '',
                status: request.courseStatus
            })
        }
        res.json({status:'ok', msg : 'Data siswa berhasil ditambahkan'});
    } catch (error) {
        console.log('Siswa Controller insert error ',error);
    }
}

export const updateStudent = async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({msg:errors.array()});
    // }
    try {
        const id = req.params.id
        const request = req.body;
        const file = req.file;
        const checkDay = JSON.parse(request.checkDay);
        //console.log(request)
        let dataToUpdate = {
            name: request.name,
            nickname: request.nickname,
            gender: request.gender,
            dob: (request.dob==='null' || request.dob==='') ? null: moment(request.dob).format('YYYY-MM-DD'),
            place_birth: request.place_birth,
            address: request.address,
            parent: request.parent,
            phone: request.phone,
            join_date: moment(request.join_date).format('YYYY-MM-DD'),
            info: request.info,
        }
        if(file) {
            const response = await Students.findOne({
                where : {
                    id: id
                }
            })
            const photo = response.photo;
            if(photo!==null && photo!=='') {
                const path = "./public/images/"+photo;
                if (fs.existsSync(path)) {
                    try {
                        fs.unlinkSync(path)
                      } catch(err) {
                        console.error('err delet file',err)
                      }
                }
            }

            dataToUpdate.photo= file.filename;
        }

        const student = await Students.update(dataToUpdate,
        {
            where: {
                id
            }
        }
        );
        var scheduleHistoryId = request.scheduleHistoryId
        if(request.insertScheduleHistories==='true' || scheduleHistoryId==0) {
            //insert new schedule history default
            const scheduleHistory = await StudentScheduleHistories.create({
                studentId:id,
                date_start:request.dateScheduleHistories===''?moment(request.join_date).format('YYYY-MM-DD'):request.dateScheduleHistories,
                info:''
            })
            scheduleHistoryId = scheduleHistory.id
        } else {
            // delete data schedule first
            await StudentScheduleDefaults.destroy(
            {
                where : {
                    studentScheduleHistoryId: scheduleHistoryId
                }
            }
            );

        }
        

        checkDay.forEach(async element => {
            await StudentScheduleDefaults.create({
                studentScheduleHistoryId:scheduleHistoryId,
                day:element.day,
                start_time:moment(element.start_time).format('HH:mm:ss'),
                end_time:moment(element.end_time).format('HH:mm:ss'),
            })
        });

        res.json({status:'ok', msg : 'Data siswa berhasil diupdate'});
    } catch (error) {
        console.log('Siswa Controller update error ',error);
    }
}

export const deleteStudent = async(req,res) =>  {
    try {
        const { id } = req.params;

        const response = await Students.findOne({
            where : {
                id: id
            }
        })
        const photo = response.photo;
        if(photo!==null && photo!=='') {
            const path = "./public/images/"+photo;
            if (fs.existsSync(path)) {
                try {
                    fs.unlinkSync(path)
                  } catch(err) {
                    console.error('err delet file',err)
                  }
            }
        }

        const student = await Students.destroy(
        {
            where : {
                id: id
            }
        }
        );
        res.json({status:'ok', msg : 'Data siswa berhasil dihapus'});
    } catch (error) {
        console.log('Students Controller delete error ',error);
    }
}

export const getStudentCourseHistories = async (req,res) => {
    try {
        const id = req.params.id
        const courseHistories = await CourseHistories.findAll(
            {
                where: {studentId:id},
                order: [
                    ['date', 'DESC'],
                ],
                include: [{
                    model:Courses,
                }],
            }
        );
        res.json({status:'ok', data:courseHistories});
    } catch (error) {
        console.log('Students Course Histories Controller error ',error);
    }
}

export const insertStudentCourseHistory = async (req, res) => {
    try {
        const request  = req.body;
        const file = req.file;
        // console.log('hasil',JSON.stringify(request,null,2));
        // console.log('hasil_image',file);
        
        //res.json({status:'ok',data:request, msg : 'Data kursus siswa berhasil ditambahkan'});
        let dataToInsert = {
            studentId: request.studentId,
            courseId: request.courseId,
            level: request.level,
            date: (request.date===null || request.date==='') ? null: moment(request.date).format('YYYY-MM-DD'),
            status: request.status,
            info: request.info
        }
        if(file) {
            dataToInsert.photo= file.filename;
        }
        const courseHistory = await CourseHistories.create(dataToInsert);
        res.json({status:'ok', data:courseHistory, msg : 'Data kursus siswa berhasil ditambahkan'});
    } catch (error) {
        console.log('Course History Controller insert error ',error);
    }
}

export const updateStudentCourseHistory = async (req, res) => {
    try {
        const request  = req.body;
        const file = req.file;
        if(!req.params.id) return res.status(400).json({msg:'Update gagal, coba reload halaman browser!'})
        const { id } = req.params;

        let dataToUpdate = {
            studentId: request.studentId,
            courseId: request.courseId,
            level: request.level,
            date: (request.date===null || request.date==='') ? null: moment(request.date).format('YYYY-MM-DD'),
            status: request.status,
            info: request.info
        }
        if(file) {
            const response = await CourseHistories.findOne({
                where : {
                    id: id
                }
            })
            const photo = response.photo;
            if(photo!==null && photo!=='') {
                const path = "./public/images/"+photo;
                if (fs.existsSync(path)) {
                    try {
                        fs.unlinkSync(path)
                      } catch(err) {
                        console.error('err delet file',err)
                      }
                }
            }

            dataToUpdate.photo= file.filename;
        }

        const courseHistory = await CourseHistories.update(
            dataToUpdate,
        {
            where : {
                id: id
            }
        }
        );
        res.json({status:'ok', msg : 'Data kursus siswa berhasil diupdate'});
    } catch (error) {
        console.log('Course History Controller update error ',error);
    }
}

export const deleteStudentCourseHistory = async(req,res) =>  {
    try {
        const { id } = req.params;
        const response = await CourseHistories.findOne({
            where : {
                id: id
            }
        })
        const photo = response.photo;
        if(photo!==null && photo!=='') {
            const path = "./public/images/"+photo;
            if (fs.existsSync(path)) {
                try {
                    fs.unlinkSync(path)
                  } catch(err) {
                    console.error('err delet file',err)
                  }
            }
        }
        const courseHistory = await CourseHistories.destroy(
        {
            where : {
                id: id
            }
        }
        );
        res.json({status:'ok', msg : 'Data kursus siswa berhasil dihapus'});
    } catch (error) {
        console.log('Course History Controller delete error ',error);
    }
}

export const getStudentSchedule = async (req,res) => {
    try {
        const request = req.body;
        var siswaSelected =[];
        if(request.selectedSiswa) {
            siswaSelected = request.selectedSiswa.map(item=> item.value)
        }
        var startDate = request.dateRangeSchedule[0]!==null?moment(request.dateRangeSchedule[0]):null;
        var endDate = request.dateRangeSchedule[1]!==null?moment(request.dateRangeSchedule[1]):null;

        //console.log(startDate, endDate);
        var where = {}
        if(siswaSelected.length > 0) {
            where = {
                id: siswaSelected
            }
        }
       // console.log(request);

       var days = endDate.diff(startDate,'days');
       var listDayHeaders =[];
       var listDateCheck = [];
       var dateCheck='';
       for (let index = 0; index <= days; index++) {
            dateCheck = (moment(startDate).add(index,'d'));
            listDateCheck.push(dateCheck);
            listDayHeaders.push(dateCheck.format('YYYY-MM-DD'));

            // check schedule

       }

        var students = await Students.findAll({
            include: {
                model: StudentScheduleHistories,
                // where: {
                //     date_start: {
                //         [Op.gte]:startDate.format('YYYY-MM-DD'),
                //         [Op.lte]:endDate.format('YYYY-MM-DD')
                //     }
                // },
                required:false,
                include: {
                    model:StudentScheduleDefaults
                }

            },
            where: where,
            order: [
                ['name','asc'],
                [{model:StudentScheduleHistories},'date_start','desc'],
                [{model:StudentScheduleHistories},{model:StudentScheduleDefaults},'day','asc']
            ]
        });

        // console.log(students)

        var listDefSchedule=[]
        var listNewSchedule = []
        var studentSchedule = []
        var schedule = []
        var studentScheduleHistories = []
        var scheduleDefActive = []
        var defSchedule = undefined;
        var scheduleHistoriesCount = 0;
        var scheduleHistoriesCurrent = '';
        var schedulePerDate = {};
        var schedulePerDateSchedule = [];

        for (let index = 0; index < students.length; index++) {

            studentScheduleHistories = students[index].student_schedule_histories;

            // get data schedule yang sudah di set
            schedule = [];
            schedule = await Schedule.findAll({
                where:{
                    studentId:students[index].id,
                    date: {
                        [Op.gte]:startDate.format('YYYY-MM-DD'),
                        [Op.lte]:endDate.format('YYYY-MM-DD')
                    }
                }
            })

            

            // listDefSchedule = await StudentScheduleDefaults.findAll({
            //     where:{studentId:students[index].id},
            //     order:[['day','asc']]
            // });
            //console.log(listDefSchedule);
            studentSchedule=[];
            scheduleHistoriesCount = 0;
            scheduleHistoriesCurrent = '';
            scheduleDefActive =[];
            

            //loop list date yang akan di check
            listDateCheck.map(item=> {
                schedulePerDate = {
                    date:item.format('YYYY-MM-DD')
                };
                schedulePerDateSchedule = [];
                var mySchedule = schedule.find(sc => sc.date===item.format('YYYY-MM-DD'));
                
                //check untuk setiap schedule histories
                listDefSchedule=[];
                if(studentScheduleHistories.length>0) {
                    for (let ih = 0; ih < studentScheduleHistories.length; ih++) {
                        if(studentScheduleHistories[ih].date_start <= item.format('YYYY-MM-DD')) {
                            listDefSchedule = studentScheduleHistories[ih].student_schedule_defaults
                            if (scheduleHistoriesCurrent != studentScheduleHistories[ih].date_start) {
                                scheduleHistoriesCurrent = studentScheduleHistories[ih].date_start;
                                scheduleHistoriesCount++
                                if(scheduleHistoriesCount<=1) {
                                    scheduleDefActive = listDefSchedule;
                                } else {
                                    scheduleDefActive = [{status:'double_schedule_default'}];
                                }
                            }
                    
                            break;
                        }
                        
                    }
                }
                // end check untuk setiap schedule histories
                
                defSchedule = listDefSchedule.length>0?listDefSchedule.find(ds => ds.dataValues.day==item.format('d')):undefined;

                if(defSchedule!==undefined || mySchedule!==undefined) {
                    if(mySchedule!==undefined) {
                        schedulePerDateSchedule.push(mySchedule)
                    }
                    if(defSchedule!==undefined) {
                        schedulePerDateSchedule.push({'type':'default','start_time':defSchedule.start_time, 'end_time': defSchedule.end_time})
                    }
                    schedulePerDate = {...schedulePerDate, schedule : schedulePerDateSchedule}
                } else {
                    schedulePerDate = {...schedulePerDate, schedule : []}
                }

                /*
                if(mySchedule!==undefined) {
                    if(mySchedule.start_time===null || mySchedule.end_time===null) {
                        studentSchedule.push('*[set]');
                    } else {
                        studentSchedule.push(mySchedule);
                    }
                } else if(defSchedule!==undefined) {
                    studentSchedule.push({'start_time':defSchedule.start_time, 'end_time': defSchedule.end_time});
                } else {
                    studentSchedule.push('[set]')
                }
                */
                studentSchedule.push(schedulePerDate);
            })
            
            listNewSchedule.push({
                ...students[index].dataValues,
                student_schedule_defaults: scheduleDefActive, //listDefSchedule.filter(item=>item.dataValues),
                studentSchedule
            });
            // listNewSchedule.push({
            //     ...students[index].dataValues,
            //     studentSchedule
            // });
        }
        /*
        Promise.all(
            students.map( async(element,index) => {
                await new Promise(resolve => {
                    listDefSchedule = StudentScheduleDefaults.findAll({where:{studentId:element.id}});
                    console.log('id ke ',element.id);
                    console.log(listDefSchedule);
                    listNewSchedule.push({...element.dataValues,student_schedule_defaults:listDefSchedule.dataValues});
                })
                throw new Error('Oops!');
            
            })
        )
        .catch(err => {
            console.log('error iteration : ',err.message);
          });
        */
        // console.log('akhir iterasi iterasi')
        // console.log('data schedule new',listNewSchedule);
        res.json({status:'ok', data:listNewSchedule, header:listDayHeaders});
    } catch (error) {
        console.log('Students Schedule Controller error ',error);
    }
}

export const setSchedule = async (req, res) => {
    const request = req.body;
    
    let startTime = request.start_time;
    let endTime = request.end_time;
    if(request.radioJadwalGanti==='libur'){
        startTime=null;
        endTime=null;
    }

    try{
        if(request.hasOwnProperty('scheduleAdd')) {
            
            if(request.radioJadwalGanti==='hapusJadwalGanti') {
            await Schedule.destroy({
                    where:{
                        id:request.scheduleAdd.id,
                        date:request.date
                    }
                })
            } else if(request.radioJadwalGanti==='gantiJadwal') {
                await Schedule.update({
                    start_time:startTime,
                    end_time:endTime
                },
                {
                    where:{
                        id:request.scheduleAdd.id,
                        date:request.date

                    }
                }
                )
            }
        } else {
            if(request.addJadwalGanti || request.radioJadwalGanti==='gantiJadwal' || request.radioJadwalGanti==='libur') {
                await Schedule.create({
                    studentId:request.siswaId,
                    date:request.date,
                    start_time:startTime,
                    end_time:endTime
                })
            }
        }

        res.json({status:'ok', msg : 'Jadwal kursus berhasil diupdate.'});
    } catch(err) {
        console.log('error update jadwal',err)
        res.sendStatus(500);
    }
    
}


export const getStudentAbsen = async (req,res) => {
    try {
        const request = req.body;
        var siswaSelected =[];
        if(request.selectedSiswa) {
            siswaSelected = request.selectedSiswa.map(item=> item.value)
        }
        var startDate = request.dateRangeSchedule[0]!==null?moment(request.dateRangeSchedule[0]):null;
        var endDate = request.dateRangeSchedule[1]!==null?moment(request.dateRangeSchedule[1]):null;
        console.log('egan : ',process.env.db_user)
        res.json(request);
    } catch(err) {
        console.log(err)
    }
}





export const scheduleSetDefault = async (req,res) => {
    try {
        const request = req.body;
        var siswaSelected =[];
        if(request.selectedSiswa) {
            siswaSelected = request.selectedSiswa.map(item=> item.value)
        }
        var startDate = request.dateRangeSchedule[0]!==null?moment(request.dateRangeSchedule[0]):null;
        var endDate = request.dateRangeSchedule[1]!==null?moment(request.dateRangeSchedule[1]):null;

        var where = {}
        if(siswaSelected.length > 0) {
            where = {
                id: siswaSelected
            }
        }

       var days = endDate.diff(startDate,'days');
       var listDateCheck = [];
       var dateCheck='';
       for (let index = 0; index <= days; index++) {
            dateCheck = (moment(startDate).add(index,'d'));
            listDateCheck.push(dateCheck);

       }

        var students = await Students.findAll({
            where: where,
            order: [['name','asc']]
        });

        var listDefSchedule=[]
        var listNewSchedule = []
        var studentSchedule = []
        var schedule = []
        for (let index = 0; index < students.length; index++) {

            studentSchedule=[];
            listDateCheck.map(item=> {
                var mySchedule = schedule.find(sc => sc.date===item.format('YYYY-MM-DD'));
                studentSchedule.push(mySchedule!==undefined?mySchedule:'[set]');
            })
            listDefSchedule = await StudentScheduleDefaults.findAll({
                where:{studentId:students[index].id},
                order:[['day','asc']]
            });
            listNewSchedule.push({
                ...students[index].dataValues,
                student_schedule_defaults:listDefSchedule.filter(item=>item.dataValues),
                studentSchedule
            });
        }
        /*
        Promise.all(
            students.map( async(element,index) => {
                await new Promise(resolve => {
                    listDefSchedule = StudentScheduleDefaults.findAll({where:{studentId:element.id}});
                    console.log('id ke ',element.id);
                    console.log(listDefSchedule);
                    listNewSchedule.push({...element.dataValues,student_schedule_defaults:listDefSchedule.dataValues});
                })
                throw new Error('Oops!');
            
            })
        )
        .catch(err => {
            console.log('error iteration : ',err.message);
          });
        */
        // console.log('akhir iterasi iterasi')
        // console.log('data schedule new',listNewSchedule);
        res.json({status:'ok', data:listNewSchedule, header:listDayHeaders});
    } catch (error) {
        console.log('Students Schedule Controller error ',error);
    }
}