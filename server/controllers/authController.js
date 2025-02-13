import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req,res)=>{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
        return res.json({success:false,
            message:"Please fill all fields"})
    }
        try{
            const existingUser=await userModel.findOne({email})
            if(existingUser){
                return res.json({success:false,
                    message:"User already exists"
                });
            }
            const hashedPassword=await bcrypt.hash(password,10);
            const user=new userModel({name,email,password:hashedPassword});
            await user.save();
            const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
            res.cookie('token',token,{
                httpOnly:true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production'?'none':'strict',
                maxAge:7*24*60*60*1000
            });
            //sending welcome email
            const mailOptions={
                from:process.env.SENDER_EMAIL,
                to: email,
                subject: 'Welcome to our website',
                text: `Welcome to our website, ${name}. Your account has been created with email id: ${email} `
            }

            await transporter.sendMail(mailOptions);
            return res.json({
                success:true
            })
        }catch(error){
            res.json({success:false,
                message:error.message});
        }
}
export const login = async (req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.json({success:false,
            message:'Email and password are required'
        })
    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,
                message:'User not found'})
        }
        const isMatchPassword=await bcrypt.compare(password,user.password);
        if(!isMatchPassword){
            return res.json({success:false,
                message:'Invalid password'})
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'strict',
            maxAge:7*24*60*60*1000
        });
        return res.json({
            success:true
        })
    }catch(error){
        res.json({success:false,
            message:error.message});
    }
}

export const logout =async (req,res)=>{
    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'strict',
            maxAge:7*24*60*60*1000
        })
        return res.json({success:true,
            message:'Logged out successfully'});
    }catch(error){
        res.json({success:false,
            message:error.message});
    }
}
//send verification OTP to user's email
export const sendVerifyOtp=async(req,res)=>{
    try{
        const {userId}=req.body;
        const user=await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success:false,message:"Account already verified"})
        }
        const otp=String(Math.floor(100000 + Math.random()*900000));
        user.verifyOtp=otp;
        user.verifyOtpExpireAt=Date.now()+24*60*60*1000;
        await user.save();
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verfication OTP',
            text: `Your OTP is ${otp}.Verify your account using this OTP.`
        }
        await transporter.sendMail(mailOptions);
        res.json({
            success:true,
            message:'Verification OTP sent to email'
        })
    }catch(error){
        res.json({success:false,
            message:error.message});
    }
}

