import {User} from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
// import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { sendVerificationEmail} from "../resend/email.js";
import { sendWelcomeEmail } from "../resend/email.js";
import {sendPasswordResetEmail} from "../resend/email.js";
import {sendResetSuccessEmail} from "../resend/email.js";
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
    const {email,password}=req.body;
    try {
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({succes: false,message:"Invalid credentials"});
          }
        const isPasswordValid=await bcryptjs.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({success:false,message:"Invalid credentials"});
        }
        const isVerified=user.isVerified;
        if(!isVerified){
            return res.status(400).json({success:false,message:"User not verified"});
        }
        generateTokenAndSetCookie(res,user._id);
        res.status(200).json({
            success: true,
            message: "Login successful"
        })
    } catch (error ) {
        console.log("error loading in ",error);
        res.status(400).json({success:false,message:error.message});
    }
    // res.send("login route");
};

export const logout=async(req,res)=>{
    res.clearCookie("token");
    res.status(200).json({success:true,message:"Logged out successfully"});

    res.send("logout route");
};

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


export const forgotPassword=async(req,res)=>{
    const { email }=req.body;
    try {
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({succes:false,message:"User not found"});
        }
       const resetPasswordToken= crypto.randomBytes(32).toString("hex");
       const resetPasswordExpiresAt=Date.now()+1*60*60*1000;
       user.resetPasswordToken=resetPasswordToken;
       user.resetPasswordExpiresAt=resetPasswordExpiresAt;
       await user.save();
       await sendPasswordResetEmail(user.email,`${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`);
       res.status(200).json({success:true,message:"Password reset email sent successfuly"});
    } catch (error) {
        
    }

}

export const resetPassword=async(req,res)=>{

    try {
    const {token}    =req.params;
    const {password} =req.body;
    const user =await User.findOne({
        resetPasswordToken:token,
        resetPasswordExpiresAt: {$gt: Date.now()},
    })
    if(!User){
        return res.status(400).json({succcess:false,message:"Invalid or expired reset token"});
    }
    const hashedPassword=await bcryptjs.hash(password,10);
    user.password=hashedPassword;
    user.resetPasswordExpiresAt=undefined;
    user.resetPasswordToken=undefined;
    await user.save();f
    await sendResetSuccessEmail(user.email);
    res.status(200).json({success:true,message:"Password reset successfulyu"});
    } catch (error) {
        console.log("error resetting the password",error);
        res.status(400).json({success:false,message:error.message});
        
    }
}


export const checkAuth=async(req,res)=>{
    try {
        const user=await User.findById(req.userId);
        if(!user){
            return res.status(400).json({success:false,message:"User mot found"});
        }
    res.status(200).json({succcess:true,user:{...user._doc,password:undefined}});
    } catch (error) {
        console.log("error checkign auth",error);
        res.status(400).json({success:false,message:error.message});
    }
};

