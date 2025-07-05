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