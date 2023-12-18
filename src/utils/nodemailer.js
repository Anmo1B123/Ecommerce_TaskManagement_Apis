import nodemailer from 'nodemailer';


export const sendEmail= async (emailBody)=>{

    const transport= nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: 
    {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },


    });


    const emailOptions={
        from: "projectDb1-TestEmail.com",
        to: emailBody.email,
        subject: emailBody.subject,
        text: emailBody.message
    };


    return await transport.sendMail(emailOptions);
};
