import { type NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: "userId required" }, { status: 400 });
    }

    // Generate JWT token that can be used to authenticate MCP calls
    const token = jwt.sign(
      { userId, type: "mcp" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return Response.json({ token }, { status: 200 });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
