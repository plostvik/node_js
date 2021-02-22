const path = require('path');

const { Router } = require('express');
const multer = require('multer');
const UserController = require('../controller/user.controller');
const AuthController = require('../controller/auth.controller');

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public');
  },
  filename: function (req, file, cb) {
    const { ext } = path.parse(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, format allowed!'));
    }
  },
});

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
router.patch(
  '/avatars',
  AuthController.checkToken,
  upload.single('avatar'),
  UserController.minifyUserAvatar,
  UserController.updateUserAvatar,
);

module.exports = router;
