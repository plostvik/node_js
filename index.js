const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const contactRouter = require('./routes/contact.routes');

const PORT = process.env.port || 8080;

class Server {
  constructor() {
    this.server = null;
  }

  start() {
    this.server = express();
    this.initMiddlewares();
    this.initRoutes();
    this.listen();
    this.connectToDb();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(
      cors({
        origin: '*',
      }),
    );
    this.server.use(morgan('dev'));
  }

  async connectToDb() {
    try {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Database connection successful');
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }

  initRoutes() {
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
