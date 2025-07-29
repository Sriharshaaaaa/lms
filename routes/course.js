const express= require('express');
const router= express.Router();

const {createCourse,getAllCourses,getCourseById} = require('../controllers/courseController');
const {authenticateJWT,requireAdmin} = require('../middleware/auth');

//only admins can create
router.post('/',authenticateJWT,requireAdmin,createCourse);
//public:list all
router.get('/',getAllCourses);
//public:get course
router.get('/:id',getCourseById);

module.exports = router;