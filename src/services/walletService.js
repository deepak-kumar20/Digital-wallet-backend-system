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
  const wallet = await walletRepository.getWalletByUserId(userId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }
  const newBalance = Number(wallet.balance) + Number(amount);
  await walletRepository.updateWalletBalance(userId, newBalance);
  await transactionService.recordTransaction(userId, null, amount, "DEPOSIT");
  return newBalance;
};
const withdrawFunds = async (userId, amount) => {
  const wallet = await walletRepository.getWalletByUserId(userId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }
  if (Number(wallet.balance) < Number(amount)) {
    throw new Error("Insufficient funds");
  }
  const newBalance = Number(wallet.balance) - Number(amount);
  await walletRepository.updateWalletBalance(userId, newBalance);
  await transactionService.recordTransaction(userId, null, amount, "WITHDRAW");
  return newBalance;
};
const transferFunds = async (senderId, receiverId, amount) => {
  console.log("Transfer request:", { senderId, receiverId, amount });
  const senderWallet = await walletRepository.getWalletByUserId(senderId);
  const receiverWallet = await walletRepository.getWalletByUserId(receiverId);
  console.log("Sender wallet:", senderWallet);
  console.log("Receiver wallet:", receiverWallet);
  if (!senderWallet || !receiverWallet) {
    console.error("Sender or receiver wallet not found");
    throw new Error("Sender or receiver wallet not found");
  }
  if (Number(senderWallet.balance) < Number(amount)) {
    console.error("Insufficient funds");
    throw new Error("Insufficient funds");
  }
  const newSenderBalance = Number(senderWallet.balance) - Number(amount);
  const newReceiverBalance = Number(receiverWallet.balance) + Number(amount);
  await walletRepository.updateWalletBalance(senderId, newSenderBalance);
  await walletRepository.updateWalletBalance(receiverId, newReceiverBalance);
  await transactionService.recordTransaction(
    senderId,
    receiverId,
    amount,
    "TRANSFER",
  );
  console.log("Transfer successful:", { newSenderBalance, newReceiverBalance });
  return {
    senderBalance: newSenderBalance,
    receiverBalance: newReceiverBalance,
  };
};
module.exports = {
  getWalletBalance,
  addFunds,
  withdrawFunds,
  transferFunds,
};
