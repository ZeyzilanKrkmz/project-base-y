const mongoose=require("mongoose");
const {Schema}=mongoose;

const schema=new Schema({
    role_name: {type:String,required:true,unique:true},
    is_active: {type:Boolean,default:true},
    created_by:{
        type:mongoose.SchemaTypes.ObjectId
    }

    },{
    versionKey:false,
    timestamps: {
        createdAt:"created_at",
        updatedAt:"updated_at"

    }
});

class Roles extends mongoose.Model{

    async deleteOne(query){
         if(query._id){
             await RolePrivileges.deleteOne({role_id: query._id});
         }

        super.deleteOne(query);
    }



}
schema.loadClass(Roles);
module.exports=mongoose.model("roles",schema);