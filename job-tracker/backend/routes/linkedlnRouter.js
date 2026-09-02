const express = require('express')
const router = express.Router();
const { Segments, Joi, celebrate } = require('celebrate')
const linkedlnController = require('../controllers/linkedlnController')

router.post('/accessToken', 
    celebrate({
        [Segments.BODY]: Joi.object({
            authCode: Joi.string().required(),
            redirectUrl: Joi.string().required()
        })
    }),
    linkedlnController.accessToken
)

router.post('/userInfo', 
    celebrate({
        [Segments.BODY]: Joi.object({
            accessToken: Joi.string().required(),
        })
    }),
    linkedlnController.getUserInfo
)

module.exports = router