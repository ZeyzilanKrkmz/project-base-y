const logger=require("./logger");
let instance=null;

class LoggerClass{
    constructor(){
        if(!instance){
            instance=this;
        }
        return instance;
    }

    createLogObject(level,email,location,proc_type,log){
        return {
            level,email,location,proc_type,log
        }
    }
    info(email,location,proc_type,log){
        let logData=this.createLogObject(email,location,proc_type,log);
        logger.info(logData);
    }
    warn(email,location,proc_type,log){
        let logData=this.createLogObject(email,location,proc_type,log);
        logger.info(logData);
    }
    error(email,location,proc_type,log){
        let logData=this.createLogObject(email,location,proc_type,log);
        logger.info(logData);
    }
    verbose(email,location,proc_type,log){
        let logData=this.createLogObject(email,location,proc_type,log);
        logger.info(logData);
    }
    silly(email,location,proc_type,log){
        let logData=this.createLogObject(email,location,proc_type,log);
        logger.info(logData);
    }
    http(email,location,proc_type,log){
        let logData=this.createLogObject(email,location,proc_type,log);
        logger.info(logData);
    }
    debug(email,location,proc_type,log){
        let logData=this.createLogObject(email,location,proc_type,log);
        logger.info(logData);
    }
}
module.exports=new LoggerClass();