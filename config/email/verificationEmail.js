// emailTemplate.js
  const verificationEmail = (verificationCode) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Verification Code</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 10px 0;
            }
            .header h1 {
                margin: 0;
                color: #333333;
            }
            .content {
                text-align: center;
                padding: 20px 0;
            }
            .content p {
                font-size: 16px;
                color: #666666;
            }
            .code {
                font-size: 24px;
                font-weight: bold;
                color: #333333;
                background-color: #f4f4f4;
                padding: 10px 20px;
                border-radius: 5px;
                display: inline-block;
                margin-top: 10px;
            }
            .footer {
                text-align: center;
                padding: 10px 0;
                font-size: 12px;
                color: #999999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Memory Scroll</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Your verification code is:</p>
                <div class="code">${verificationCode}</div>
                <p>Please use this code to complete your verification.</p>
            </div>
            <div class="footer">
                <p>Thank you for using Memory Scroll.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}


export default verificationEmail
