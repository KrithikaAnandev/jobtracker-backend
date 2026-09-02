const express = require('express');
const router = express.Router();
const jobTrackerController = require('../controllers/jobTrackerController');
const { celebrate, Joi, Segments, } = require('celebrate');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, jobTrackerController.getJobs);

router.post(
    '/addJob', 
    celebrate({
        [Segments.BODY]: Joi.object({
            companyName: Joi.string().required(),
            jobTitle: Joi.string().required(),
            location: Joi.string(),
            workMode: Joi.string(),
            jobType: Joi.string(),
            status: Joi.string(),
            applicationDate: Joi.date().required(),
            salary: Joi.number(),
            source: Joi.string(),
            jobUrl: Joi.string(),
            notes: Joi.string(),
        })
    }),
    authMiddleware,
    jobTrackerController.createJob
);

router.patch(
    '/:id', 
    celebrate({
        [Segments.BODY]: Joi.object({
            companyName: Joi.string(),
            jobTitle: Joi.string(),
            location: Joi.string(),
            workMode: Joi.string(),
            jobType: Joi.string(),
            status: Joi.string(),
            applicationDate: Joi.date(),
            salary: Joi.number(),
            source: Joi.string(),
            jobUrl: Joi.string(),
            notes: Joi.string(),
            user: Joi.string()
        }).min(1)
    }),
    authMiddleware,
    jobTrackerController.updateJob
);

router.delete('/:id', authMiddleware, jobTrackerController.deleteJob);

module.exports = router;