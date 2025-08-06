const Enum=require("../config/Enum")
const CustomError=require("./Error");


class Response {
    constructor() {}

    static successResponse(data, code = 200) {
        return {
            code,
            data
        };
    }

    static errorResponse(err) {
        console.error(err);
        if(err instanceof CustomError){
        return {
            code:err.code,
            error: {
                message: err.message || "Internal Server Error",
                description: err.description || null
            }
        };
    }else {
            if (!err.message.includes("E11000")) {
            } else {

                return {
                    code: Enum.HTTP_CODES.CONFLICT,
                    error: {
                        message: "Already Exists!!",
                        description: "Already Exists!"
                    }
                }
            }
        }


    };
}

module.exports = Response;
