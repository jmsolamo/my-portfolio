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

    // 2. Deliver message securely to FormSubmit using server-side environment variables
    const recipientEmail =
      process.env.CONTACT_EMAIL || "solamojamesmichael@gmail.com";

    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer") ||
      "http://localhost:3000";
    const referer =
      request.headers.get("referer") ||
      origin ||
      "http://localhost:3000/";

    const forwardRes = await fetch(
      `https://formsubmit.co/ajax/${recipientEmail}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: origin,
          Referer: referer,
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `Portfolio Message from ${name}`,
          _template: "table",
          _captcha: "false",
          _replyto: email,
        }),
      }
    );

    const forwardData = await forwardRes.json();
    if (
      forwardRes.ok &&
      (forwardData.success === "true" || forwardData.success === true)
    ) {
      return Response.json({
        success: true,
        message: "Message sent successfully!",
      });
    } else {
      return Response.json(
        {
          success: false,
          message:
            forwardData.message || "Failed to send message. Please try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Contact API submission error:", error);
    return Response.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
