const transactionRepository = require("../repositories/transactionRepository");

// Updated to accept transactional client (Unit of Work)
const recordTransaction = async (
  client,
  fromUser,
  toUser,
  amount,
  status = "SUCCESS",
) => {
  return await transactionRepository.recordTransaction(
    client,
    fromUser,
    toUser,
    amount,
    status,
  );
};

const getTransactionsByUserId = async (userId, cursor, limit) => {
  return await transactionRepository.getTransactionsByUserId(userId, cursor, limit);
};

module.exports = {
  recordTransaction,
  getTransactionsByUserId,
};
