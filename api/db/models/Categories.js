const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    name:{type:String,required:true},
    is_active: {type: Boolean, default: true},
    created_by: {type: mongoose.SchemaTypes.ObjectId}

    },{
    versionKey:false,
    timestamps: {
        createdAt:"created_at",
        updatedAt:"updated_at"

    }
});

class Categories extends mongoose.Model{

}
schema.loadClass(Categories);
const CategoriesModel=mongoose.model("categories",schema);
module.exports=CategoriesModel;