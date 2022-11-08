import Job from '../models/Job.js';
import { StatusCodes } from 'http-status-codes';
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from '../errors/index.js';
import checkPermission from '../utils/checkPermission.js';
import mongoose from 'mongoose';
import moment from 'moment';

const createJob = async (req, res) => {
  const { position, company } = req.body;
  if (!position || !company) {
    throw new BadRequestError('Please provide all values');
  }

  const job = await Job.create({ ...req.body, createdBy: req.user.userId });
  res.status(StatusCodes.CREATED).json({
    job,
  });
};

const getAllJob = async (req, res) => {
  const { status, jobType, sort, search } = req.query;

  const queryObject = {
    createdBy: req.user.userId,
  };

  // Add stuffs based on condition
  if (status && status !== 'all') {
    queryObject.status = status;
  }

  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  if (search) {
    queryObject.position = { $regex: search, $options: 'i' };
  }

  // NO AWAIT
  let result = Job.find(queryObject);

  // handling sorting
  if (sort === 'latest') {
    result = result.sort('-createdAt'); // - signifies descending
  }

  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }

  if (sort === 'a-z') {
    result = result.sort('position');
  }

  if (sort === 'z-a') {
    result = result.sort('-position');
  }

  // Paginate records || the skip and limit enable us to do pagination in mongodb
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  // enables you to skip a record using this will skip the first record
  const skip = limit * (page - 1);

  result.skip(skip).limit(limit);

  const jobs = await result;

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({
    jobs,
    totalJobs,
    numOfPages,
  });
};

const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    throw new NotFoundError('Job not found');
  }
  await job.remove();
  res.status(StatusCodes.OK).json({ msg: 'Success!, job removed' });
};

const getJob = async (req, res) => {
  res.send('Get Single Job');
};

const updateJob = async (req, res) => {
  const { id: jobId } = req.params;
  const { position, company } = req.body;
  if (!position || !company) {
    throw new BadRequestError('Please provide all values');
  }

  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    throw new NotFoundError('Job not found');
  }

  //check permission // you can have this as a middleware
  checkPermission(req.user, job.createdBy);

  const updatedJob = await Job.findOneAndUpdate({ _id: jobId }, req.body, {
    new: true,
    runValidators: true, // when the property (position, company) is updated, it will run the validators
  });
  res.status(StatusCodes.OK).json({ updatedJob });
};

const showStats = async (req, res) => {
  // for aggregation we need to setup a series of steps 1st is the match then group
  let stats = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats?.pending || 0,
    interview: stats?.interview || 0,
    declined: stats?.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = moment()
        // accepts 0-11
        .month(month - 1)
        .year(year)
        .format('MMM Y');

      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({
    defaultStats,
    monthlyApplications,
  });
};

export { createJob, getAllJob, updateJob, getJob, deleteJob, showStats };
