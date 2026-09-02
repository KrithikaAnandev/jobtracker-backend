const express = require('express'); //import a express
const cors = require('cors'); // import the CORS middleware
const dotenv = require('dotenv'); // to get data from env
const authRoutes = require('./routes/authRouter');
const jobRoutes = require('./routes/jobTracker');
const linkedlnRoutes = require('./routes/linkedlnRouter');
const googleRoutes = require('./routes/GoogleRouter');
const connectDB = require('./config/db');
const { errors } = require('celebrate');

dotenv.config(); //loads variable from .env into process.env

const app = express(); //create a express app

connectDB()

app.use(cors()); // allow request from differnt region
app.use(express.json()) // Parse icoming json data

app.use('/api/auth', authRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/linkedln', linkedlnRoutes);
app.use('/api/google', googleRoutes);

app.use(errors());

app.use((err, req, res, next) => {
    if (err.code === 11000) {
        return res.status(400).json({
            message: 'An account with this email already exists'
        });
    }
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server error'
    });
})

app.get('/health', (req, res) => {
    res.send('Job Tracker is running')
})

app.listen(process.env.PORT, () => {
    console.log(`Server runing on port ${process.env.PORT}`)
})