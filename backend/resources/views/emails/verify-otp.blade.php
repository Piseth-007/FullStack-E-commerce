<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Botaniq</title>
</head>

<body
    style="margin: 0; padding: 0; background-color: #F8F7F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E2320; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
        style="background-color: #F8F7F4; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
                    style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E6E4DE; border-radius: 0px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); overflow: hidden;">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 36px 40px 20px; text-align: center; border-bottom: 1px solid #F0EFEA;">
                            <span
                                style="font-size: 13px; letter-spacing: 3px; font-weight: 600; text-transform: uppercase; color: #4A6B53; display: inline-block;">🌿
                                BOTANIQ</span>
                            <div
                                style="font-size: 11px; letter-spacing: 1.5px; color: #8A8F87; text-transform: uppercase; margin-top: 4px;">
                                Botanical Skincare</div>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 40px 28px;">
                            <h1
                                style="margin: 0 0 12px; font-size: 22px; font-weight: 600; color: #1E2320; text-align: center; font-family: 'Georgia', serif;">
                                Verify Your Email Address</h1>
                            <p
                                style="margin: 0 0 24px; font-size: 14.5px; line-height: 1.6; color: #5C625A; text-align: center;">
                                @if (!empty($name))
                                    Hello <strong>{{ $name }}</strong>,<br>
                                @endif
                                Thank you for creating an account with Botaniq. Enter the verification code below to
                                confirm your email and activate your account:
                            </p>

                            <!-- OTP Box -->
                            <div
                                style="background-color: #F3F6F4; border: 1.5px solid #D2DDD5; padding: 20px 24px; text-align: center; margin: 28px 0; border-radius: 4px;">
                                <div
                                    style="font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #4A6B53; margin-bottom: 8px;">
                                    Verification Code</div>
                                <div
                                    style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #1E2320; padding-left: 10px;">
                                    {{ $otp }}</div>
                            </div>

                            <p
                                style="margin: 0 0 16px; font-size: 13px; color: #767D74; text-align: center; line-height: 1.5;">
                                ⏱️ This code will expire in <strong>10 minutes</strong>.
                            </p>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <div style="border-top: 1px solid #F0EFEA;"></div>
                        </td>
                    </tr>

                    <!-- Security Note -->
                    <tr>
                        <td style="padding: 24px 40px 36px; background-color: #FAFAF8;">
                            <p
                                style="margin: 0 0 8px; font-size: 12px; line-height: 1.6; color: #8A8F87; text-align: center;">
                                If you did not create an account with Botaniq, you can safely ignore this email. Someone
                                may have entered your address by mistake.
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #B0B5AD; text-align: center;">
                                &copy; {{ date('Y') }} Botaniq Skincare. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>
