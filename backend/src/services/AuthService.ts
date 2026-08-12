import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository.js";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: Record<string, string>) {
    const { name, email, password } = data;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email is already registered.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = this.generateToken(String(user._id), user.email);
    return { user, token };
  }

  async login(data: Record<string, string>) {
    const { email, password } = data;

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new Error("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    const token = this.generateToken(String(user._id), user.email);
    return { user, token };
  }

  private generateToken(id: string, email: string) {
    return jwt.sign(
      { id, email },
      process.env.JWT_SECRET || "super_secret_jwt_key_12345",
      { expiresIn: "7d" },
    );
  }
}
