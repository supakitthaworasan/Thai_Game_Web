export const validateRequest = (schema) =>{
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success){
            return res.status(400).json({
                message: 'Validation Failed',
                errors: result.error.issues.map((issue)=> ({
                    field: issue.path[0],
                    message: issue.message
                }))
            });
        }

        req.body = result.data;

        next();
    };
};