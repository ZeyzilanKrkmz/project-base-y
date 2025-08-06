const express=require("express");
const router=express.Router();
const permissions = require("../config/role_prvgs");


const Roles=require("../db/models/Roles");
const RolePrivileges=require("../db/models/RolePrivileges");

const Response=require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const Categories = require("../db/models/Categories");

router.get("/",async (req,res)=>{
    try{
        let roles=await Roles.find({});

        res.json(Response.successResponse(roles));
    }catch(err){
        let errorResponse=Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);

    }
});

router.post("/add",async(req,res)=>{
    try{
        if(!req.body.role_name) throw new CustomError(
            Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!",
            "_id field must be filled."
        );

        if(!req.body.permissions||!Array.isArray(req.body.permissions)||permissions.length==0){
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!",
                "permissions field must be an Array."
            );
        }

        let role=new Roles({
            role_name:req.body.role_name,
            is_active:true,
            created_by:req.user?.id
        });

        await role.save();

        for (let i=0;i<permissions.length;i++){
            let priv=new RolePrivileges({
                role_id:role._id,
                permission:permissions[i],
                created_by:req.user?.id,

            });

            await priv.save();
        }

        await Categories.deleteOne({_id:req.body._id});

        res.json(Response.successResponse({success:true}));
    }catch(err){
        let errorResponse=Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});


router.post("/update",async(req,res)=>{
    try{
        if(!req.body._id) throw new CustomError(
            Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!",
            "_id field must be filled."
        );
        let update={};
        if(req.body.role_name)update.role_name=req.body.role_name;
        if(typeof req.body.is_active==="boolean")update.is_active=req.body.is_active;

        if(!req.body.permissions&&!Array.isArray(req.body.permissions)&&req.body.permissions.length>0) {

            let permissions=await RolePrivileges.find({role_id:req.body._id});

            let removedPermissions=permissions.filter(x=>!req.body.permissions.includes(x.permission))
            let newPermissions=body.permissions.filter(x=>!permissions.map(p=> {
                return p.permissions
            }).includes(x));

            if(removedPermissions.length>0){
                await RolePrivileges.remove({_id:{$in:removedPermissions.map(x=>x._id)}})
            }

            if(newPermissions.length>0){
                for (let i = 0; i <newPermissions.length; i++) {
                    let priv = new RolePrivileges({
                        role_id: req.body._id,
                        permission: newPermissions[i],
                        created_by: req.user?.id,

                    });
                    await priv.save();
                }
            }


        }

        await Roles.updateOne({_id:req.body._id},updates);

        await Categories.deleteOne({_id:req.body._id});

        res.json(Response.successResponse({success:true}));
    }catch(err){
        let errorResponse=Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});


router.post("/delete",async(req,res)=>{
    try{
        if(!req.body._id) {
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!",
                "_id field must be filled."
            );
        }
        await Roles.deleteOne({_id:req.body._id});


        res.json(Response.successResponse({success:true}));
    }catch(err){
        let errorResponse=Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});
router.get("/role_prvgs", async (req, res) => {
    try {
        const grouped = permissions.privGroups.map(group => {
            return {
                ...group,
                privileges:permissions.privileges.filter(p => p.group === group.id)
            };
        });

        res.json({
            success: true,
            data: grouped
        });
    } catch (err) {
        console.error("Privilege list error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


module.exports=router;