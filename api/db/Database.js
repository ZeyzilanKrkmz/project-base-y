const mongoose=require("mongoose")
let instance=null;
class Database{

    constructor(){

        if(!instance){
            this.mongoConnection=null;
            instance=this;
        }
        return instance;
    }
    async connect(options){
        const url = process.env.MONGO_URI;
        try{
            console.log("DB connecting....")
            let db=await mongoose.connect(process.env.CONNECTION_STRING);

            this.mongoConnection=db;
            console.log("DB Connected.");

        }catch(err){
            console.error(err);
            process.exit(1);

        }

    }

}
module.exports=Database;