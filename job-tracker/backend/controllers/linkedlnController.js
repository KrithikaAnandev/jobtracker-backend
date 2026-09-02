const axios = require("axios");
const qs = require("querystring");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/authModel')

exports.accessToken = async (req, res, next) => {
  try {
    const { authCode, redirectUrl } = req.body;

    const params = qs.stringify({
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: redirectUrl,
      client_id: process.env.LINKEDIN_CLIENTID,
      client_secret: process.env.LINKEDIN_CLIENTSECRET,
    });

    const tokenResponse = await axios.post(
      `${process.env.LINKEDIN_URL}/oauth/v2/accessToken`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const linkedinAccessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get(
      `${process.env.LINKEDIN_USER}/v2/userinfo`,
      {
          headers: {
              Authorization: `Bearer ${linkedinAccessToken}`
          }
      }
    );

    const { email, name } = userResponse.data;

    let user = await User.findOne({ email });

    if(!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name,
        email,
        password: hashedPassword
      });
    }

    const token = jwt.sign(
      {
        user_id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      message: 'Login Successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserInfo = async (req, res, next) => {
    try {
        const { accessToken } = req.body;

        const response = await axios.get(
            `${process.env.LINKEDIN_USER}/v2/userinfo`,
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