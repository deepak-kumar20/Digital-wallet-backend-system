const transactionRepository = require("../repositories/transactionRepository");

// For deposit/withdraw: pass (userId, null, amount, status)
// For transfer: pass (fromUser, toUser, amount, status)
const recordTransaction = async (
  fromUser,
  toUser,
  amount,
  status = "SUCCESS",
) => {
  return await transactionRepository.recordTransaction(
    fromUser,
    toUser,
    amount,
    status,
  );
};

const getTransactionsByUserId = async (userId) => {
  return await transactionRepository.getTransactionsByUserId(userId);
};

module.exports = {
  recordTransaction,
  getTransactionsByUserId,
};
