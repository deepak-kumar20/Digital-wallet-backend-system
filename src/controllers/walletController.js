const walletService = require("../services/walletService");
const transactionRepository = require("../repositories/transactionRepository");

const getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = await walletService.getWalletBalance(userId);
    res.status(200).json({ success: true, balance: wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addFunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const newBalance = await walletService.addFunds(userId, amount);
    res.status(200).json({ success: true, balance: newBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const withdrawFunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const newBalance = await walletService.withdrawFunds(userId, amount);
    res.status(200).json({ success: true, balance: newBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const transferFunds = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, amount } = req.body;
    const result = await walletService.transferFunds(
      senderId,
      receiverId,
      amount,
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getBalance,
  addFunds,
  withdrawFunds,
  transferFunds,
};
