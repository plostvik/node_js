const fs = require('fs');

const Joi = require('Joi');
const dotenv = require('dotenv');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const User = require('../models/Users');

dotenv.config();
const PORT = process.env.port || 8080;

class UserController {
  getCurrentUser(req, res) {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
  }

  async updateUserSubscription(req, res) {
    try {
      const { subscription } = req.body;
      const { _id } = req.user;
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        { subscription },
        {
          new: true,
        },
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'Not found' });
      }

      res.json(updatedUser);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  validateUpdateSubscription(req, res, next) {
    const validationRules = Joi.object({
      subscription: Joi.string()
        .default('free')
        .valid('free', 'pro', 'premium')
        .required(),
    });

    const validationResult = validationRules.validate(req.body);

    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    next();
  }

  async updateUserAvatar(req, res) {
    try {
      const { _id, avatarURL: oldAvatarUrl } = req.user;
      const oldAvatarPath = oldAvatarUrl.replace(
        `http://localhost:${PORT}/images/`,
        './public/',
      );
      fs.unlinkSync(oldAvatarPath);
      const { filename: newAvatarName } = req.file;

      const updatedUser = await User.findByIdAndUpdate(
        _id,
        { avatarURL: `http://localhost:${PORT}/images/${newAvatarName}` },
        {
          new: true,
        },
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'Not found' });
      }

      res.json({
        avatarURL: updatedUser.avatarURL,
      });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  async minifyUserAvatar(req, res, next) {
    try {
      const file = await imagemin(
        [`${req.file.destination}/${req.file.filename}`],
        {
          destination: 'public/',
          plugins: [
            imageminPngquant({
              quality: [0.6, 0.8],
            }),
          ],
          progressive: true,
          arithmetic: true,
        },
      );

      if (!file) {
        throw new Error('Whoops! Something went wrong');
      }
      next();
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
}

module.exports = new UserController();
