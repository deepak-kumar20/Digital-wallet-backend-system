const pool = require("../config/db");

// For deposit/withdrawal
const recordTransaction = async (
  fromUser,
  toUser,
  amount,
  status = "SUCCESS",
) => {
  const result = await pool.query(
    "INSERT INTO transactions (from_user, to_user, amount, status) VALUES ($1, $2, $3, $4) RETURNING *",
    [fromUser, toUser, amount, status],
  );
  return result.rows[0];
};

// For transaction history (fetch all where user is sender or receiver)
const getTransactionsByUserId = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM transactions WHERE from_user = $1 OR to_user = $1 ORDER BY created_at DESC",
    [userId],
  );
  return result.rows;
};

module.exports = {
  recordTransaction,
  getTransactionsByUserId,
};
