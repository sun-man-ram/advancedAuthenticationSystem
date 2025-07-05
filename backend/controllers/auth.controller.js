import {User} from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
// import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { sendVerificationEmail} from "../resend/email.js";
import { sendWelcomeEmail } from "../resend/email.js";
export const signup= async(req,res)=>{
const {email,password,name}=req.body;

    try {
        if(!email||!password||!name){
            throw new Error("All fields are rquired");
        }
        const userAlreadyExists= await User.findOne({email});
        if(userAlreadyExists){
            return res.status(400).json({success:false,message:"User Already Exists"});
        }

        const hashedPassword=await bcryptjs.hash(password,10);
        const verificationToken=Math.floor(100000+Math.random() * 900000).toString();
        const user = new User({
            email,
            password:hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt:Date.now() +24*60*60*1000
        })
        await user.save();

        await sendVerificationEmail(user.email,verificationToken);

        //jwt token need to be created
        generateTokenAndSetCookie(res,user._id);
        res.status(201).json({
            success:true,
            message:"User Created successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
    });
        
    } catch (error) {
        res.status(400).json({success:false,message:error.message});
        
    }
}
export const login =async(req,res)=>{
    
    // res.send("login route");
}
export const logout=async(req,res)=>{
    res.send("logout route");
}

export const verifyEmail=async(req,res)=>{
    const {code}=req.body;
    try {
        const user=await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt:Date.now()},

        })

        if(!user){
            return res.status(400).json({success: false,message:"Invalid or expired verification code "});
        }
        user.isVerified=true;
        user.verificationToken=undefined;
        user.verificationTokenExpiresAt=undefined;
        await user.save();
        await sendWelcomeEmail(user.email,user.name);
        res.status(200).json({success:true,message:"Email verified successfully"});
    } catch (error) {
        console.log("Erro verifying email",error);
        res.status(400).json({success:false,message:error.message});
    }

}