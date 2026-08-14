import { UserRepository } from "../repositories/UserRepository.js";

const userRepository = new UserRepository();

export class UserService {
  async syncClerkUser(clerkId: string, email: string, name?: string) {
    // Map incoming name to firstName/lastName for the Mongoose schema
    const parts = name ? name.split(" ") : [];
    const firstName = parts[0] || undefined;
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;

    let user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      user = await userRepository.findByEmail(email);
      if (user) {
        user.clerkUserId = clerkId;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        await user.save();
      } else {
        user = await userRepository.create({
          clerkUserId: clerkId,
          email,
          firstName,
          lastName,
        } as any);
      }
    } else {
      user.email = email;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      await user.save();
    }
    return user;
  }
}
