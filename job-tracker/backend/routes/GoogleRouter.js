const express = require('express')
const router = express.Router();
const { Segments, Joi, celebrate } = require('celebrate')
const googleController = require('../controllers/googleController')

router.post('/accessToken', 
    celebrate({
        [Segments.BODY]: Joi.object({
            authCode: Joi.string().required(),
            redirectUrl: Joi.string().required()
        })
    }),
    googleController.accessToken
)

router.post('/userInfo', 
    celebrate({
        [Segments.BODY]: Joi.object({
            accessToken: Joi.string().required(),
        })
    }),
    googleController.getUserInfo
)

module.exports = router