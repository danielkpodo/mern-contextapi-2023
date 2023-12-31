import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err);
  const defaultError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong. Try again later',
  };

  /** Handling database validation error */
  if (err.name === 'ValidationError') {
    defaultError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(',');
    defaultError.statusCode = 400;
  }

  /** Handle duplicate error */
  if (err.code && err.code === 11000) {
    defaultError.statusCode = 400;
    defaultError.msg = `${Object.keys(err.keyValue)} field must be unique`;
  }

  /**
   * From mosh course simplified
   */

  // simplified error handling
  // for (field in err.errors) {
  //   if (err.errors[field]) {
  //     return res.status(400).send(err.errors[field].message);
  //   }
  // }

  /** Return only one error @time */
  const errors = defaultError.msg.split(',');
  errors.map((error) => {
    if (error) {
      return res.status(defaultError.statusCode).json({
        statusCode: defaultError.statusCode,
        msg: error,
      });
    }
  });
};

export default errorHandlerMiddleware;
