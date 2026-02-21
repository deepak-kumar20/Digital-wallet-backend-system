const { pool } = require("pg");
const pool = require("../config/db");
const walletRepository = require("../repositories/walletRepository");
const transactionService = require("./transactionService");

const getWalletBalance = async (userId) => {
  const wallet = await walletRepository.getWalletByUserId(userId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }
  return wallet.balance;
};

const addFunds = async (userId, amount) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const wallet = await walletRepository.getWalletByUserIdForUpdate(
      client,
      userId,
    );
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    const newBalance = Number(wallet.balance) + Number(amount);
    await client.query("UPDATE wallets SET balance = $1 WHERE user_id = $2", [
      newBalance,
      userId,
    ]);
    await transactionService.recordTransaction(userId, null, amount, "DEPOSIT");
    await client.query("COMMIT");
    return newBalance;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const withdrawFunds = async (userId, amount) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const wallet = await walletRepository.getWalletByUserIdForUpdate(
      client,
      userId,
    );
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    if (Number(wallet.balance) < Number(amount)) {
      throw new Error("Insufficient funds");
    }
    const newBalance = Number(wallet.balance) - Number(amount);
    await client.query("UPDATE wallets SET balance = $1 WHERE user_id = $2", [
      newBalance,
      userId,
    ]);
    await transactionService.recordTransaction(
      userId,
      null,
      amount,
      "WITHDRAW",
    );
    await client.query("COMMIT");
    return newBalance;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const transferFunds = async (senderId, receiverId, amount) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const senderWallet = await walletRepository.getWalletByUserIdForUpdate(
      client,
      senderId,
    );
    const receiverWallet = await walletRepository.getWalletByUserIdForUpdate(
      client,
      receiverId,
    );
    if (!senderWallet || !receiverWallet) {
      throw new Error("Sender or receiver wallet not found");
    }
    if (Number(senderWallet.balance) < Number(amount)) {
      throw new Error("Insufficient funds");
    }
    const newSenderBalance = Number(senderWallet.balance) - Number(amount);
    const newReceiverBalance = Number(receiverWallet.balance) + Number(amount);
    await client.query("UPDATE wallets SET balance = $1 WHERE user_id = $2", [
      newSenderBalance,
      senderId,
    ]);
    await client.query("UPDATE wallets SET balance = $1 WHERE user_id = $2", [
      newReceiverBalance,
      receiverId,
    ]);
    await transactionService.recordTransaction(
      senderId,
      receiverId,
      amount,
      "TRANSFER",
    );
    await client.query("COMMIT");
    return {
      senderBalance: newSenderBalance,
      receiverBalance: newReceiverBalance,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
module.exports = {
  getWalletBalance,
  addFunds,
  withdrawFunds,
  transferFunds,
};
