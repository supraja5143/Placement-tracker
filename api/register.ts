import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withHandler } from "./_lib/middleware";
import { hashPassword, signToken } from "./_lib/auth";
import { storage } from "./_lib/storage";

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { username, password } = req.body;

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
});
