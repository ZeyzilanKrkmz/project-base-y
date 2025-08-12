const express =require("express");
const router=express.Router();
const AuditLogs=require("../db/models/AuditLogs");
const Categories=require("../db/models/Categories");
const Users=require("../db/models/Users");
const Response=require("../lib/Response");
const moment=require("moment");
const auth=require("../lib/auth")();

router.all("*",auth.authenticate(),async(req,res,next)=>{
    next();
});

/*
* 1.auditlogs tablosunda işlem yapan kişilerin kaç kez işlem yaptığını veren bir sorgu.
* 2.Kategori tablosunda tekil veri sayısı
* 3.Kaç sistemde tanımlı kaç kullanıcı var*/
router.post("/auditlogs",async(req,res)=>{
    try{
        let body=req.body;
        let filter={};
        if(typeof body.is_active==="boolean") filter.is_active=body.is_active;
        if(typeof body.location==="string") filter.location=body.location;

        let result=await AuditLogs.aggregate([
            {$match:filter},
            {$group:{_id: {email:"$email",proc_type:"$proc_type"}},count:{$sum:1}},
            {$sort:{count:-1}},
        ]);

    }catch(err){
        let errorResponse=Response.errorResponse(err,req.user?.language);
        res.status(errorResponse.code).json(errorResponse);
    }

});

router.post("/categories/unique",async(req,res)=>{
    try{

        let body=req.body;
        let filter={};
        if(typeof body.is_active==="boolean") filter.is_active=body.is_active;

        let result=await Categories.distinct("name",filter);

        res.json(Response.successResponse(result));

    }catch(err){
        let errorResponse=Response.errorResponse(err,req.user?.language);
        res.status(errorResponse.code).json(errorResponse);
    }

});
router.post("/users/count",async(req,res)=>{
    try{
        let body=req.body;
        let filter={};

        if(typeof body.is_active==="boolean") filter.is_active=body.is_active;

        let result=await Users.count(filter);

        res.json(Response.successResponse(result));

    }catch(err){
        let errorResponse=Response.errorResponse(err,req.user?.language);
        res.status(errorResponse.code).json(errorResponse);
    }

});
module.exports=router;