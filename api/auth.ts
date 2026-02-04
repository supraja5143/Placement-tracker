import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withHandler } from "./_lib/middleware";
import { hashPassword, comparePasswords, signToken } from "./_lib/auth";
import { storage } from "./_lib/storage";
import { z } from "zod";

const authInput = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const action = req.query.action as string;

  if (action === "login") {
    const result = authInput.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: result.error.errors[0].message });
      return;
    }
    const { username, password } = result.data;

    const user = await storage.getUserByUsername(username);
    if (!user || !(await comparePasswords(password, user.password))) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const token = signToken(user);

    res.status(200).json({
      token,
      user: { id: user.id, username: user.username },
    });
  } else if (action === "register") {
    const result = authInput.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: result.error.errors[0].message });
      return;
    }
    const { username, password } = result.data;

    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({ username, password: hashedPassword });
    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username },
    });
  } else if (action === "logout") {
    res.status(200).json({ message: "Logged out" });
  } else {
    res.status(400).json({ message: "Invalid action. Use ?action=login|register|logout" });
  }
});
