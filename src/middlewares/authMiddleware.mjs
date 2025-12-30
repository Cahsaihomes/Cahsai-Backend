import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
  let token = req.cookies && req.cookies.token;
  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized: No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized: Invalid token" });
  }
};
