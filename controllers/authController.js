import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';

const register = async (req, res, next) => {
  const { name, password, email } = req.body;
  if (!name || !password || !email) {
    throw new BadRequestError('Please provide all values');
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) throw new BadRequestError('Email already exists');

  const user = await User.create(req.body);
  const token = user.createJWT();
  user.password = undefined;
  return res
    .status(StatusCodes.CREATED)
    .json({ user, token, location: user.location });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide all values');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new UnauthenticatedError('Invalid credentials');

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) throw new UnauthenticatedError('Invalid credentials');
  const token = user.createJWT();
  user.password = undefined;
  res.status(StatusCodes.OK).json({
    user,
    token,
    location: user.location,
  });
};

const updateUser = async (req, res) => {
  const { email, lastName, location, name } = req.body;
  if (!email || !lastName || !location || !name) {
    throw new BadRequestError('Please provide all values');
  }

  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.lastName = lastName;
  user.name = name;
  user.location = location;

  //necessary to send back token if user contains some updated information
  const token = user.createJWT();
  await user.save();

  res.status(StatusCodes.OK).json({
    user,
    token,
    location: user.location,
  });
};

export { register, login, updateUser };
