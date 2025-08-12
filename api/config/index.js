module.exports={

    "LOG_LEVEL":process.env.LOG_LEVEL ||"debug",
    "CONNECTION_STRING":process.env.CONNECTION_STRING||"mongodb://localhost:27017/myStudies/project-base-y",
    "JWT":{
        "SECRET":"123456",
        "EXPIRE_TIME":!isNaN(parseInt(process.env.TOKEN_EXPIRE_TIME))?(parseInt(process.env.TOKEN_EXPIRE_TIME)):24*60*60
    },
    "DEFAULT_LANG":process.env.DEFAULT_LANG||"EN"
}
