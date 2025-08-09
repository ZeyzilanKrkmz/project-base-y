const express=require('express');
const app=express();

app.use(express.json());

app.post('/api/users/auth',(req,res)=>{
    res.json({success:true,body:req.body});
});

app.listen(3001,()=>{
    console.log('test server running at http://localhost:3001');
});