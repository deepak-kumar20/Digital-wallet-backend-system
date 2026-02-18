const pool = require('../config/db');

const createWallet = async (userId) => 
    {
    const result = await pool.query(
        'INSERT INTO wallets  (user_id, balance) VALUES ($1, $2) RETURNING *',
        [userId,0]
    )
}

const getWalletByUserId = async (userId) => {
    const result = await pool.query(
        'SELECT * FROM wallets WHERE user_id =$1',
        [userId]
    )
    return result.rows[0];
}
const updateWalletBalance = async (userId, newBalance) => {
    const result = await pool.query(
        'UPDATE wallets SET balance= $1 WHERE user_id=$2 RETURNING *',
        [newBalance, userId]
    )
    return result.rows[0];
}

module.exports = {
    createWallet,
    getWalletByUserId,
    updateWalletBalance
}