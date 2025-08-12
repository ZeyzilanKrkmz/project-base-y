const Enum=require("../config/Enum")
const config=require("../config");
const CustomError=require("./Error");
const i18n=new(require("../i18n/i18nn"))(config.DEFAULT_LANG);


class Response {
    constructor() {}

    static successResponse(data, code = 200) {
        return {
            code,
            data
        };
    }

    static errorResponse(err,lang) {
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
                        message: i18n.translate("COMMON.ALREADY_EXISTS",lang),
                        description: i18n.translate("COMMON.ALREADY_EXISTS",lang)
                    }
                }
            }
            return {
                code: Enum.HTTP_CODES.INT_SERVER_ERROR,
                error: {
                    message: i18n.translate("COMMON.UNKNOWN_ERROR",lang),
                    description: i18n.translate("COMMON.UNKNOWN_ERROR",lang)
                }
            }
        }
    };
}

module.exports = Response;
