const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");
const walletRepository = require("../repositories/walletRepository");

const registerUser = async (email, password) => {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    console.log("User already Exists");
    throw new Error("User already exists");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await userRepository.createUser(email, passwordHash);
  await walletRepository.createWallet(newUser.id);
  return newUser;
};

const loginUser = async (email, password) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }
  return user;
};

module.exports = {
  registerUser,
  loginUser,
};
