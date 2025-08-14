const passport=require("passport");
const {ExtractJwt,Strategy}=require("passport-jwt");
const Users=require("../db/models/Users");
const Roles=require("../db/models/Roles");
const UserRoles=require("../db/models/UserRoles");
const RolePrivileges=require("../db/models/RolePrivileges");
const config=require("../config");
const prvgs=require("../config/role_prvgs");
const Response=require("./Response");
const {HTTP_CODES}=require("../config/Enum");


module.exports=function(){
    let strategy=new Strategy({
        secretOrKey:config.JWT.SECRET,
        jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken()
    },async(payload,done)=> {

        try{

            let user=await Users.findOne({_id:payload.id});

            if(user){
                let userRoles=await UserRoles.find({user_id:payload._id});

                let rolePrivileges=await RolePrivileges.find({role_id:{$in:userRoles.map(ur=>ur.role_id)}});
                let privileges=rolePrivileges.map(rp=>prvgs.privileges.find(x=>x.key==rp.permission))



                done(null,{
                    id:user._id,
                    roles:rolePrivileges,
                    email:user.email,
                    first_name:user.first_name,
                    last_name:user.last_name,
                    language:user.language,
                    exp:parseInt(Date.now()/1000)*config.JWT.EXPIRE_TIME

                });

            }else {
                done(new Error("User not found"),null);
            }

        }catch(err){
            done(err,null);
        }

    });

    passport.use(strategy);

    return {
        initialize:function(){
            return passport.initialize();
        },
        authenticate:function(){
            return passport.authenticate("passport-jwt",{session:false})
        },
        checkRoles:(...expectedRoles)=>{
            return(req,res,next)=>{
                let i=0;
                let privileges=req.user.roles.filter(x=>x).map(x=>x.key);

                while(i<expectedRoles.length&&!privileges.includes(expectedRoles[i]))i++;

                if(i>=expectedRoles.length){
                    let response=Response.errorResponse(new CustomError(HTTP_CODES.UNAUTHORIZED,"need permission","need permission"));
                    return res.json(response.code).json(response);
                }

                return next();
            }
        }
    }

}
