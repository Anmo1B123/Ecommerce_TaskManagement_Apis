import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

const sendEmail= async (emailBody)=>{

    const transport= nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: 
    {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },


    });

    const mailGenerator = new Mailgen({
        theme: 'cerberus',
        product: {
            
            name: 'Ecom',
            link: 'https://Ecom.js/'
        }
    });

    const email = {
        body: {
            name: emailBody.name,
            intro: emailBody.intro,
            action: {
                instructions: `Please click the button below to ${emailBody.instructions}. The link will be valid for next 10 minutes.`,
                button: {
                    color: '#22BC66', // Optional action button color
                    text: emailBody.buttonText,
                    link: emailBody.link
                }
            },
            outro: 'Need help, or have questions? Just reply to this email: "Ecom_Dev_101@gmail.com", we\'d love to help.'
        }
    }; 


    const emailHtml= mailGenerator.generate(email)
    const emailText= mailGenerator.generatePlaintext(email)


    const emailOptions={
        from: "Ecom_TestEmail@gmail.com",
        to: emailBody.email,
        subject: emailBody.subject,
        html: emailHtml,
        text: emailText
    };


    return await transport.sendMail(emailOptions);
};



const sendPasswordResetEmail= async (name, email, link)=>{

const emailBody={

    name,
    email,
    subject: 'Password Reset',
    intro: 'You have received this e-mail because a password reset request for your account was received',
    instructions: 'reset your password',
    buttonText: 'Reset your Password',
    link

}

    return await sendEmail(emailBody);

};

const sendEmailVerifyEmail= async (name, email, link)=>{

    const emailBody={

        name,
        email,
        subject: 'Email Verification',
        intro: 'You have received this e-mail because an email verification request for your account was received',
        instructions: 'verify your email',
        buttonText: 'Verify your Email',
        link
    
    }
    
        return await sendEmail(emailBody);


};



export {sendPasswordResetEmail, sendEmailVerifyEmail};