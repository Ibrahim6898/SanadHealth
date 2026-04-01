export const errorMiddleware = (err, req, res, _next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err);

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({
      message: "A record with this value already exists",
      field: err.meta?.target,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
