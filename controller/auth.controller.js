const fs = require('fs');

const Joi = require('Joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jdenticon = require('jdenticon');
const dotenv = require('dotenv');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const { v4: uuidv4 } = require('uuid');
const sgMail = require('@sendgrid/mail');
const User = require('../models/Users');

dotenv.config();
const PORT = process.env.port || 8080;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class AuthController {
  registerUser = async (req, res) => {
    try {
      const { body } = req;
      const hashedPassword = await bcrypt.hash(body.password, 2);

      const isEmailUnique = await User.findOne({
        email: body.email,
      });

      if (isEmailUnique) {
        return res.status(409).json({ message: 'Email in use' });
      }

      const avatarName = Date.now();
      const tmpPath = `./tmp/${avatarName}.png`;
      this.generateAvatar(tmpPath);
      this.minifyAvatar(tmpPath);

      const verificationToken = uuidv4();
      this.sendVerificationEmail(body.email, verificationToken);

      const user = await User.create({
        ...body,
        password: hashedPassword,
        avatarURL: `http://localhost:${PORT}/images/${avatarName}.png`,
        verificationToken,
      });

      const { email, subscription } = user;
      const response = {
        user: { email, subscription },
      };

      res.status(201).json(response);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  validateRegisterUser(req, res, next) {
    const validationRules = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      subscription: Joi.string()
        .default('free')
        .valid('free', 'pro', 'premium'),
    });

    const validationResult = validationRules.validate(req.body);

    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    next();
  }

  generateAvatar = path => {
    const size = 200;
    const value = Date.now().toString(); //создаю уникальный value для генерации уникальных аватаров
    const png = jdenticon.toPng(value, size);
    return fs.writeFileSync(path, png);
  };

  async minifyAvatar(path) {
    try {
      const [file] = await imagemin([path], {
        destination: 'public/',
        plugins: [
          imageminPngquant({
            quality: [0.6, 0.8],
          }),
        ],
        progressive: true,
        arithmetic: true,
      });

      if (!file) {
        throw new Error('Whoops! Something went wrong');
      }
      return fs.unlinkSync(path);
    } catch (err) {
      return err;
    }
  }

  async sendVerificationEmail(email, token) {
    const msg = {
      to: email,
      from: 'plostvik@gmail.com', // Change to your verified sender
      subject: 'Please verify your email',
      text: 'Verify your account',
      html: `Welcome to our application. Please, verify your account by clicking on this <a href="http://localhost:${PORT}/auth/verify/${token}">link</>`,
    };
    await sgMail.send(msg);
  }

  async loginUser(req, res) {
    const {
      body: { email, password },
    } = req;
    try {
      const user = await User.findOne({
        email,
      });

      if (!user) {
        return res.status(401).json({ message: 'Email or password is wrong' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Email or password is wrong' });
      }

      const token = jwt.sign(
        {
          userId: user._id,
        },
        process.env.JWT_SECRET,
      );

      const response = {
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      };

      await User.findByIdAndUpdate(user._id, { token });
      return res.json(response);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  validateUser(req, res, next) {
    const validationRules = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    const validationResult = validationRules.validate(req.body);

    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    next();
  }

  async checkToken(req, res, next) {
    const authorizationHeader = req.get('Authorization');
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const token = authorizationHeader.replace('Bearer ', '');

    try {
      const payload = await jwt.verify(token, process.env.JWT_SECRET);
      const { userId } = payload;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      req.user = user;

      next();
    } catch (error) {
      return res.status(400).send({ message: 'Invalid token' });
    }
  }

  async logoutUser(req, res) {
    const { _id } = req.user;

    const userWithDeletedToken = await User.findByIdAndUpdate(_id, {
      token: null,
    });

    if (!userWithDeletedToken) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    return res.status(204).send();
  }

  async verifyUser(req, res) {
    try {
      console.log(req.params);
      const {
        params: { verificationToken },
      } = req;

      const user = await User.findOne({
        verificationToken,
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.verificationToken = undefined;
      await user.save();

      return res.status(200).json({ message: 'Success' });
    } catch (err) {
      return res.status(400).send(err.message);
    }
  }
}

module.exports = new AuthController();
