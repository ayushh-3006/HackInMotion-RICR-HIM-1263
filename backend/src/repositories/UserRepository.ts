import User, { IUser } from "../models/User.js";

export class UserRepository {
  async findByClerkId(clerkId: string): Promise<IUser | null> {
    return await User.findOne({ clerkId });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return await User.create(data);
  }
}
