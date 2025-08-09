const mongoose=require("mongoose");
const {PASS_LENGTH,HTTP_CODES}=require("../../config/Enum");
const is=require("is_js");
const CustomError=require("../../lib/Error");
const bcrypt=require("bcrypt-nodejs");

const schema=mongoose.Schema({
    email: {type:String,required:true,unique:true},
    password:{type:String,required:true},
    is_active:{type:Boolean,required:true},
    first_name:String,
    last_name:String,
    phone:String

},{
    timestamps: {
        createdAt:"created_at",
        updatedAt:"updated_at"

    }
});

class Users extends mongoose.Model{

    validPassword(password){
        return bcrypt.compareSync(password,this.password);
    }

    static validateFieldsBeforeAuth(email,password){
        if(typeof password!=="string"||password.length<PASS_LENGTH||is.not.email(email))
            throw new CustomError(HTTP_CODES.UNAUTHORIZED,"Validation Error!","email or password wrong.");
        return null;
    }

}
schema.loadClass(Users);
module.exports=mongoose.model("users",schema);