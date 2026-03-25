import asyncio
import aiosmtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

async def test_email():
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    
    print(f"Testing with: {smtp_user}, {smtp_host}:{smtp_port}")
    
    message = EmailMessage()
    message["From"] = smtp_user
    message["To"] = smtp_user
    message["Subject"] = "Test OTP"
    message.set_content("Hello")
    
    try:
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            use_tls=False,
            start_tls=True,
        )
        print("Success!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_email())
