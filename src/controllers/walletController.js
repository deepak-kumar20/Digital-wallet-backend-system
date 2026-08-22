const walletService = require("../services/walletService");
const { z } = require("zod");

// Schema Validation: Ensure positive amount with reasonable max limit
const amountSchema = z.number().positive("Amount must be greater than 0").max(1000000, "Amount exceeds maximum limit");

const getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = await walletService.getWalletBalance(userId);
    res.status(200).json({ success: true, balance: wallet });
  } catch (error) {
    console.error("Error fetching balance:", error);
    // Generic error message (Information Leakage fix)
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const addFunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const amount = amountSchema.parse(req.body.amount);
    
    const newBalance = await walletService.addFunds(userId, amount);
    res.status(200).json({ success: true, balance: newBalance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error("Error adding funds:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const withdrawFunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const amount = amountSchema.parse(req.body.amount);
    
    const newBalance = await walletService.withdrawFunds(userId, amount);
    res.status(200).json({ success: true, balance: newBalance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error("Error withdrawing funds:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const transferFunds = async (req, res) => {
  try {
    const senderId = req.user.id;
    const amount = amountSchema.parse(req.body.amount);
    const { receiverId } = req.body;
    
    const idempotencyKey = req.headers['x-idempotency-key'];
    
    const result = await walletService.transferFunds(
      senderId,
      receiverId,
      amount,
      idempotencyKey
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error("Error transferring funds:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = {
  getBalance,
  addFunds,
  withdrawFunds,
  transferFunds,
};
