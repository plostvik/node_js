const Joi = require('Joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

class AuthController {
  async registerUser(req, res) {
    try {
      const { body } = req;
      const hashedPassword = await bcrypt.hash(body.password, 2);

      const isEmailUnique = await User.findOne({
        email: body.email,
      });

      if (isEmailUnique) {
        return res.status(409).json({ message: 'Email in use' });
      }

      const user = await User.create({
        ...body,
        password: hashedPassword,
      });

      const { email, subscription } = user;
      const response = {
        user: { email, subscription },
      };

      res.status(201).json(response);
    } catch (error) {
      res.status(400).send(error);
    }
  }

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
}

module.exports = new AuthController();
