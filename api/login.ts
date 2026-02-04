import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withHandler } from "./_lib/middleware";
import { comparePasswords, signToken } from "./_lib/auth";
import { storage } from "./_lib/storage";

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { username, password } = req.body;

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
});
