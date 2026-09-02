const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/authModel');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.signUp = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        console.log(userExists);

        if (userExists) {
            return res.status(400).json({ message: 'User already exist with this email' });
        }

        const salt = await bcrypt.genSalt(10); //10 is a cost factor 
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        const token = jwt.sign(
            { user_id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(200).json({
            message: `User created successfully`,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        next(error);
    }
}

exports.signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' })

        const token = jwt.sign(
            { user_id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d'} 
        )

        res.status(200).json({
            message: 'Login Successfully',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        })

    } catch (error) {
        next(error);
    }
}

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if(!user) {
            return res.status(404).json({
                message: `User not found with this email ${email}`
            })
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GOOGLE_SMTP_EMAIL,
                pass: process.env.GOOGLE_SMTP_PASSKEY
            }
        })

        await transporter.sendMail({
            from: process.env.GOOGLE_SMTP_EMAIL,
            to: email,
            subject: 'Reset Password',
            html: `
    <h2>Reset Password</h2>
    <p>Click the link below to reset your password</p>
    <a href=http://localhost:3000/reset-password/${resetToken}>
      Reset Password
    </a>
  `
        })

        return res.status(200).json({
            message: 'Reset password email sent'
        });
    } catch (error) {
        next(error)
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const { password, token } = req.body;

        const  user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if(!user) {
            return res.status(404).json({
                message: `Token Expired or No User Exists`
            })
        }

        const salt = await bcrypt.genSalt(10); //10 is a cost factor 
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        return res.status(200).json({
            message: 'Password updated successfully'
        });

    } catch (error) {
       next(error) 
    }
}