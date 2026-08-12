import { Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ error: "Missing required fields." });
        return;
      }

      const { user, token } = await this.authService.register({
        name,
        email,
        password,
      });
      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (error: unknown) {
      console.error("Register Error:", error);
      if (
        error instanceof Error &&
        error.message === "Email is already registered."
      ) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error." });
      }
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Missing required fields." });
        return;
      }

      const { user, token } = await this.authService.login({ email, password });
      res.status(200).json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (error: unknown) {
      console.error("Login Error:", error);
      if (
        error instanceof Error &&
        error.message === "Invalid email or password."
      ) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error." });
      }
    }
  }
}
