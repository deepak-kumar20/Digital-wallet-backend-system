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
    
    // Pass the transactional client (Unit of Work)
    await transactionService.recordTransaction(client, userId, null, amount, "DEPOSIT");
    
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
    
    // Pass the transactional client (Unit of Work)
    await transactionService.recordTransaction(
      client,
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

const transferFunds = async (senderId, receiverId, amount, idempotencyKey) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Idempotency Check
    if (idempotencyKey) {
      const existing = await client.query("SELECT id FROM idempotency_keys WHERE key = $1", [idempotencyKey]);
      if (existing.rows.length > 0) {
         await client.query("ROLLBACK");
         return { message: "Transfer already processed" };
      }
      await client.query("INSERT INTO idempotency_keys (key) VALUES ($1)", [idempotencyKey]);
    }

    // Deadlock Prevention: Lock Ordering (Always lock lower ID first)
    const firstId = Math.min(senderId, receiverId);
    const secondId = Math.max(senderId, receiverId);

    const firstWallet = await walletRepository.getWalletByUserIdForUpdate(
      client,
      firstId,
    );
    const secondWallet = await walletRepository.getWalletByUserIdForUpdate(
      client,
      secondId,
    );

    const senderWallet = senderId === firstId ? firstWallet : secondWallet;
    const receiverWallet = receiverId === firstId ? firstWallet : secondWallet;

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
    
    // Pass the transactional client (Unit of Work)
    await transactionService.recordTransaction(
      client,
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
