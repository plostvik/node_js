const { Router } = require('express');
const UserController = require('../controller/user.controller');
const AuthController = require('../controller/auth.controller');

const router = Router();

router.get(
  '/current',
  AuthController.checkToken,
  UserController.getCurrentUser,
);
router.patch(
  '/',
  AuthController.checkToken,
  UserController.validateUpdateSubscription,
  UserController.updateUserSubscription,
);

module.exports = router;
