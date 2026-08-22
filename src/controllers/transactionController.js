const transactionService = require("../services/transactionService");

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id; // user id from JWT
    
    // Keyset pagination parameters
    const cursor = req.query.cursor ? parseInt(req.query.cursor, 10) : null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    
    const transactions =
      await transactionService.getTransactionsByUserId(userId, cursor, limit);
      
    // Determine next cursor
    const nextCursor = transactions.length > 0 ? transactions[transactions.length - 1].id : null;
      
    res.json({ success: true, transactions, nextCursor });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = {
  getTransactionHistory,
};
