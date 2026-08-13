import { UserRepository } from "../repositories/UserRepository.js";

const userRepository = new UserRepository();

export class UserService {
  async syncClerkUser(clerkId: string, email: string, name?: string) {
    let user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      // Might be a user registered via Google where email already exists?
      user = await userRepository.findByEmail(email);
      if (user) {
        // Update existing user with clerkId
        user.clerkId = clerkId;
        user.name = name || user.name;
        await user.save();
      } else {
        // Create new user
        user = await userRepository.create({ clerkId, email, name });
      }
    } else {
      // Update existing
      user.email = email;
      if (name) user.name = name;
      await user.save();
    }
    return user;
  }
}
