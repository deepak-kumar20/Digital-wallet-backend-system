const transactionService = require("../services/transactionService");

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id; // user id from JWT
    const transactions =
      await transactionService.getTransactionsByUserId(userId);
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTransactionHistory,
};
