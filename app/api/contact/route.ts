export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, captchaToken } = body;

    if (!name || !email || !message) {
      return Response.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (!captchaToken) {
      return Response.json(
        {
          success: false,
          message: "Please complete the reCAPTCHA verification.",
        },
        { status: 400 }
      );
    }

    // 1. Server-side reCAPTCHA verification with Google if RECAPTCHA_SECRET_KEY is configured
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (
      secretKey &&
      secretKey !== "your_recaptcha_secret_key_here" &&
      secretKey.trim() !== ""
    ) {
      const verifyRes = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            secret: secretKey.trim(),
            response: captchaToken,
          }).toString(),
        }
      );

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return Response.json(
          {
            success: false,
            message:
              "reCAPTCHA verification failed. Please try refreshing and completing the checkbox again.",
          },
          { status: 400 }
        );
      }
    }

    const recipientEmail =
      process.env.CONTACT_EMAIL || "solamojamesmichael@gmail.com";

    // 2. Deliver message: Return verification success so client can submit directly to FormSubmit
    // (Bypasses Cloudflare WAF datacenter IP blocking on AWS/Vercel serverless functions)
    return Response.json({
      success: true,
      message: "Security verification passed.",
      recipient: recipientEmail,
    });
  } catch (error) {
    console.error("Contact API verification error:", error);
    return Response.json(
      {
        success: false,
        message: "An unexpected error occurred during verification. Please try again.",
      },
      { status: 500 }
    );
  }
}
