const Job = require('../models/jobTracker')

exports.getJobs = async (req, res, next) => {
    try {
      const userId = req.userId;
      
      const jobs = await Job.find({user: userId}).sort({ createdAt: -1 }).lean();

      return res.status(200).json({ 
        message: 'job fetched succesfully', data: jobs
      })

    } catch (error) {
      next(error);
    }
}

exports.createJob = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { companyName, jobTitle, location = '', workMode = '', jobType = '', status, applicationDate, salary, source = '', jobUrl = '', notes = '' } = req.body; 

        const job = await Job.create({companyName, jobTitle, location, workMode, jobType, status, applicationDate, salary, source, jobUrl, notes, user: userId});

        return res.status(200).json({
            message: 'Job created successfully',
            data: job
        })
    } catch (error) {
       next(error); 
    }
}

exports.updateJob = async (req, res, next) => {
    try {
        const userId = req.userId;
        const data  = req.body;
        const { id } = req.params;

        const job = await Job.findOne({ _id: id, user: userId });

        if(!job) {
           return res.status(404).json({ messge: 'Job Not Found'})
        }

        const updatedJob = await Job.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        })

        res.status(200).json({ 
            message: 'Job updated successfully', data: updatedJob 
        })

    } catch (error) {
        next(error)
    }
}

exports.deleteJob = async (req, res, next) => {
    try {
        const { id } = req.params; 

        const job = await Job.findOne({ _id: id });

        if(!job) {
           return res.status(404).json({ messge: 'Job Not Found'})
        }

        await Job.findByIdAndDelete(id);
        res.status(200).json({ message: 'Job deleted successfully'})

    } catch (error) {
        next(error)
    }
}
