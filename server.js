import dotenv from 'dotenv';
import express from 'express';
import connectDb from './db/connect.js';
dotenv.config();
import 'express-async-errors';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';

const app = express();

/** Import routes */
import authRouter from './routes/authRoutes.js';
import jobRouter from './routes/jobRoutes.js';

/** Import middleware */
import errorHandlerMiddleware from './middleware/error-handler.js';
import notFoundMiddleware from './middleware/not-found.js';
//import here for all routes that need auth
import authenticateUser from './middleware/auth.js';

/** SECURITY PACKAGES */
/** Setup rate limiting expecially for login and register page */
/**
 * 1. Helmet -> secures your app by setting various http headers
 * 2. xss-clean -> To sanitize user input and prevent cross-site scripting
 * 3. express-mongo-sanitize -> To sanitize user input to prevent mongodb operator injection
 * 4 express-rate-limit -> To limit the amount of request by one IP address
 */

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

/** We can serve react build folder as a static file from node.js server
 * This is pretty cool
 */
// only use for production purposes
// app.use(express.static(path.resolve(__dirname, './client/build')));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobRouter);

/** After the /api/endpoints every route the react index file*/
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
// });

/** Middleware */
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

(async () => {
  try {
    await connectDb(process.env.MONGO_URL);
    console.log('Connected to mongodb successfully ✅');
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
})();

// the proxy in package.json -> // useful for development: it prevents us for specifying the origin of the request
// 1s = 1000ms
