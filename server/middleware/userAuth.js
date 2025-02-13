import jwt from 'jsonwebtoken';
const userAuth = async(req,res,next)=>{
    const {token}=req.cookies;
    if(!token){ 
        return res.json({success:false,message:'Please login first'});
    }
    try {
        const tokenDecode=jwt.verify(token,process.env.JWT_SECRET)
        if(tokenDecode.id){
            req.body.userId = tokenDecode.id;
        }
        else{
            return res.json({success:false,message:'Invalid token, login again'});
        }
        next();
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

export default userAuth;