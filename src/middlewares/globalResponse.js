export const globalResponse = (err, req, res, next) => {
    if (err) {
        const statusCode = err.cause || 500;
        const response = {
            success: false,
            message: err.message || 'Internal Server Error',
        };

        // Add error stack for non-production environments
        if (process.env.NODE_ENV !== 'production') {
            response.stack = err.stack;
        }

        return res.status(statusCode).json(response);
    }

    next();
};
