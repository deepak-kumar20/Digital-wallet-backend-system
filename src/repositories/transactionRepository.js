const pool = require("../config/db");

// For deposit/withdrawal
const recordTransaction = async (
  client,
  fromUser,
  toUser,
  amount,
  status = "SUCCESS",
) => {
  const result = await client.query(
    "INSERT INTO transactions (from_user, to_user, amount, status) VALUES ($1, $2, $3, $4) RETURNING *",
    [fromUser, toUser, amount, status],
  );
  return result.rows[0];
};

// For transaction history using keyset pagination
const getTransactionsByUserId = async (userId, cursor = null, limit = 10) => {
  let query = "SELECT * FROM transactions WHERE (from_user = $1 OR to_user = $1)";
  const params = [userId, limit];

  if (cursor) {
    query += " AND id < $3";
    params.push(cursor);
  }
  
  query += " ORDER BY id DESC LIMIT $2";
  
  const result = await pool.query(query, params);
  return result.rows;
};

const deleteTransactionsByUserId = async (userId) => {
  await pool.query(
    "DELETE FROM transactions WHERE from_user = $1 OR to_user = $1",
    [userId],
  );
};

module.exports = {
  recordTransaction,
  getTransactionsByUserId,
  deleteTransactionsByUserId,
};
