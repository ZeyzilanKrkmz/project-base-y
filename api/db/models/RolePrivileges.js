const mongoose=require("mongoose");

const schema=mongoose.Schema({
    permission:{type:String,required:true},
    role_id:{type:String,required:true},
    created_by:{type:mongoose.SchemaTypes.ObjectId}

    },{
    versionKey:false,
    timestamps: {
        createdAt:"created_at",
        updatedAt:"updated_at"

    }
});

class RolePrivileges extends mongoose.Model{

}
schema.loadClass(RolePrivileges);
module.exports=mongoose.model("role_privileges",schema);