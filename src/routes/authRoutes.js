const express = require("express");
const authController = require("../controllers/authControllers");
const router = express.Router();

//register route
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
