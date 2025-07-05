import {resend} from "./config.js"
import { verificationTokenEmailTemplate, WELCOME_EMAIL_TEMPLATE } from "./email-template.js";

export const sendVerificationEmail=async (email,verificationToken)=>{


try {
    
     const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [email],
    subject: "hello world",
    html: verificationTokenEmailTemplate.replace("{verificationToken}",verificationToken),
  });

} catch (error) {

    console.log("error sending verification email",error);
    throw new Error("error sending verificationemail");
    
}

 
}


export  const sendWelcomeEmail=async(email,name)=>{
  try {

     const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [email],
    subject: "Welcome to our company",
    html: WELCOME_EMAIL_TEMPLATE.replace("{name}",name)});
    
  } catch (error) {
    
  }
}

export const sendPasswordResetEmail=async(email,resetURL)=>{
  try {
 const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [email],
    subject: "Welcome to our company",
    html: `Click <a href= "${resetURL}">here </a> to reset your password`,});
  } catch (error) {
    console.log("error sending welcome email",error);
  }
}


export const sendResetSuccessEmail=async(email)=>{
   try {
 const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [email],
    subject: "password reset was successful",
    html: `your password was reset successfuly`,
  } );
}
  catch (error) {
    console.log("error sending reset password",error);
  }
}