const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { celebrate, Joi, Segments, } = require('celebrate')

router.post(
    '/signup',
    celebrate({
        [Segments.BODY]: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().required(),
            password: Joi.string().required()
        })
    }), 
    authController.signUp);

router.post(
    '/signin',
    celebrate({
        [Segments.BODY]: Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required()
        })
    }), 
    authController.signIn);

    router.post(
        '/forgot-password',
        celebrate({
            [Segments.BODY]: Joi.object({
                email: Joi.string().email().required()
            })
        }),
        authController.forgotPassword
    );

    router.post(
        '/reset-password',
        celebrate({
            [Segments.BODY]: Joi.object({
                token: Joi.string().required(),
                password: Joi.string().required()
            })
        }),
        authController.resetPassword
    )

module.exports = router;