const axios = require("axios");
const qs = require("querystring");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/authModel');

exports.accessToken = async (req, res, next) => {
    try {
        const { authCode, redirectUrl } = req.body;

        const params = qs.stringify({
            client_id: process.env.GOOGLE_CLIENTID,
            client_secret: process.env.GOOGLE_CLIENTSECRET,
            code: authCode,
            grant_type: "authorization_code",
            redirect_uri: redirectUrl,

        });

        const tokenResponse = await axios.post(
            `${process.env.GOOGLE_URL}/token`,
            params,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const googleAccessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${googleAccessToken}`,
                },
            }
        );

        const { email, name } = userResponse.data;

        let user = await User.findOne({ email });

        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                name,
                email,
                password: hashedPassword,
            });
        }

        const token = jwt.sign(
            {
                user_id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: 'Login Successfully',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserInfo = async (req, res, next) => {
    try {
        const { accessToken } = req.body;

        const response = await axios.get(
            `${process.env.GOOGLE_URL}/v2/userinfo`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        return res.status(200).json(response.data)
    } catch (error) {
        next(error)
    }
}