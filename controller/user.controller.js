const Joi = require('Joi');
const User = require('../models/Users');

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
}

module.exports = new UserController();
