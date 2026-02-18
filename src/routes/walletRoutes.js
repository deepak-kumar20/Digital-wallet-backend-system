const express = require('express');
const walletController = require('../controllers/walletController')
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/balance', authMiddleware, walletController.getBalance);
router.post('/add-funds', authMiddleware, walletController.addFunds);
router.post('/withdraw-funds', authMiddleware, walletController.withdrawFunds);
router.post('/transfer-funds', authMiddleware, walletController.transferFunds);

module.exports = router;