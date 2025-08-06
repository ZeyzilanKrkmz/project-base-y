const mongoose=require("mongoose");

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

}
schema.loadClass(Users);
module.exports=mongoose.model("users",schema);