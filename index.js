// const argv = require('yargs').argv;
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

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

// async function invokeAction({ action, id, name, email, phone }) {
//   switch (action) {
//     case 'list':
//       const list = await listContacts();
//       console.table(list);
//       break;

//     case 'get':
//       const contactToShow = await getContactById(id);
//       console.table(contactToShow);
//       break;

//     case 'add':
//       const listAfterAdd = await addContact(name, email, phone);
//       console.table(listAfterAdd);
//       break;

//     case 'remove':
//       const listAfterRemove = await removeContact(id);
//       console.table(listAfterRemove);
//       break;

//     default:
//       console.warn('\x1B[31m Unknown action type!');
//   }
// }

// invokeAction(argv);
