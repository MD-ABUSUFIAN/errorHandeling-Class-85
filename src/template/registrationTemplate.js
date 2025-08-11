exports.registrationTemplate=(name,flink,otp,expiryTime)=>{
    return `
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Registration OTP</title>
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f7f7f7;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 500px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0px 3px 10px rgba(0,0,0,0.1);
  }
  .header {
    background-color: #4cafef;
    color: white;
    text-align: center;
    padding: 20px;
    font-size: 20px;
    font-weight: bold;
  }
  .content {
    padding: 20px;
    text-align: center;
    color: #333;
  }
  .otp {
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 5px;
    margin: 15px 0;
    color: #4cafef;
  }
  .time {
    color: #e74c3c;
    font-size: 14px;
    margin-bottom: 20px;
  }
  a.verify-link {
    display: inline-block;
    background-color: #4cafef;
    color: white !important;
    padding: 12px 25px;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    font-size: 16px;
  }
  a.verify-link:hover {
    background-color: #3ba6d7;
  }
  .footer {
    background-color: #f1f1f1;
    text-align: center;
    padding: 15px;
    font-size: 12px;
    color: #777;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      Verify Your Registration
    </div>
    <div class="content">
      <p>Hi <strong>{{username}}</strong>,</p>
      <p>Use the OTP below to complete your registration:</p>
      <div class="otp">{{OTP_CODE}}</div>
      <p class="time">This OTP will expire in <strong>{{EXPIRE_TIME}} minutes</strong>.</p>
      <a href="{{VERIFY_URL}}" class="verify-link">Verify Now</a>
      <p style="margin-top: 15px; font-size: 13px; color: #777;">
        If you did not request this, please ignore this email.
      </p>
    </div>
    <div class="footer">
     
    </div>
  </div>
</body>
</html>
`
    .replace("{{username}}", name)
    .replace("{{OTP_CODE}}", otp)
    .replace("{{EXPIRE_TIME}}", expiryTime)
    .replace("{{VERIFY_URL}}", flink)
    .replace("{{COMPANY_NAME}}", "Chamok IT Solution")
    // .replace("{{YEAR}}", expiryTime.getMinutes());
}