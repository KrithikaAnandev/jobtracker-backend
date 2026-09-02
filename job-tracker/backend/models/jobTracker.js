const mongoose = require('mongoose');

const jobTrackerSchema = new mongoose.Schema(
    {
       companyName: { type: String, required: true },
       jobTitle: { type: String, required: true },
       location: { type: String },
       workMode: { type: String },
       jobType: { type: String },
       status: { type: String, required: true },
       applicationDate: { type: Date, required: true },
       salary: { type: Number },
       source: { type: String },
       jobUrl: { type: String },
       notes: { type: String },
       user: { type: String}
    },
    { timestamps : true}
)

module.exports = mongoose.model('JobTracker', jobTrackerSchema)