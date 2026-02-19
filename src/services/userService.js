const userRepository = require("../repositories/userRepository");
const walletRepository = require("../repositories/walletRepository");
const transactionRepository = require("../repositories/transactionRepository");

const getAllUsers = async () => {
  return await userRepository.getAllUsers();
};

const getUserById = async (id) => {
  return await userRepository.getUserById(id);
};

const updateUser = async (id, updates) => {
  return await userRepository.updateUser(id, updates);
};

const deleteUser = async (id) => {
  
  // Delete all transactions where user is sender or receiver
  await transactionRepository.deleteTransactionsByUserId(id);
  // Delete wallet(s) first
  await walletRepository.deleteWalletByUserId(id);
  // Then delete user
  return await userRepository.deleteUser(id);
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
