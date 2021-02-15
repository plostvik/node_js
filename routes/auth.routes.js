const { Router } = require('express');
const AuthController = require('../controller/auth.controller');

const router = Router();

router.post(
  '/register',
  AuthController.validateRegisterUser,
  AuthController.registerUser,
);
router.post('/login', AuthController.validateUser, AuthController.loginUser);
router.post('/logout', AuthController.checkToken, AuthController.logoutUser);

module.exports = router;
