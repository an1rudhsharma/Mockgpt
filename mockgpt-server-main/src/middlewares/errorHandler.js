 const errorHandler = (
    err,
    req,
    res,
    next
) => {
    if (err instanceof Error) {
        console.error(err.stack);
        res.status(500).json({
            error: err.message || "Internal Server Error",
        });
    } else {
        console.error("Unexpected error:", err);
        res.status(500).json({
            error: "Internal Server Error",
        });
    }
};

module.exports = {errorHandler}