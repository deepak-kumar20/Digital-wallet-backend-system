const userRepository = require("../repositories/userRepository");

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
  return await userRepository.deleteUser(id);
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
