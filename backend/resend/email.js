import {resend} from "./config.js"


export const sendVerificationEmail=async (email,verificationToken)=>{


try {
    
     const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [email],
    subject: "hello world",
    html: `Verify your email address with this token ${verificationToken}`,
  });

} catch (error) {

    console.log("error sending verification email",error);
    throw new Error("error sending verificationemail");
    
}

 
}