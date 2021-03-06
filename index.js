const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const contactRouter = require('./routes/contact.routes');
const authRouter = require('./routes/auth.routes');
const userRouter = require('./routes/user.routes');

const PORT = process.env.port || 8080;

class Server {
  constructor() {
    this.server = null;
  }

  start() {
    this.server = express();
    this.initMiddlewares();
    this.initRoutes();
    this.connectToDb();
    this.listen();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(
      cors({
        origin: '*',
      }),
    );
    this.server.use(morgan('dev'));
    this.server.use('/images', express.static('public'));
  }

  async connectToDb() {
    try {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      });
      console.log('Database connection successful');
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }

  initRoutes() {
    this.server.use('/auth', authRouter);
    this.server.use('/users', userRouter);
    this.server.use('/contacts', contactRouter);
  }

  listen() {
    this.server.listen(PORT, () => {
      console.log('Server is listening on port: ', PORT);
    });
  }
}

const server = new Server();
server.start();
