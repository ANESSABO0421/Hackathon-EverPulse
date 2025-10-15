import bcrypt from "bcrypt";

const password = "doctor"; // 👈 replace this with your password

const generateHash = async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log("🔐 Hashed Password:", hash);
};

generateHash();
