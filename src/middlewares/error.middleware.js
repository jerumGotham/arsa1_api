exports.errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode =
    err.status ||
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  let message = err.message || "Internal server error";

  // Prisma: unique constraint / record not found
  if (err.code === "P2002") {
    statusCode = 409;
    message = `Already exists: ${[].concat(err.meta?.target || []).join(", ")}`;
  } else if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  } else if (err.code === "P2003") {
    statusCode = 409;
    message = "Record is still in use and cannot be removed";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
