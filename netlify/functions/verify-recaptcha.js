// Netlify Function: Verify Google reCAPTCHA v2 token
// Reads secret from environment variable RECAPTCHA_SECRET

exports.handler = async function(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const secret = process.env.RECAPTCHA_SECRET;
    if (!secret) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Missing RECAPTCHA_SECRET' })
      };
    }

    const { token } = JSON.parse(event.body || '{}');
    if (!token) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Missing token' })
      };
    }

    // Optional: get client IP for verification context
    const remoteip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || '';

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);
    if (remoteip) params.append('remoteip', remoteip);

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await response.json().catch(() => ({}));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: !!data.success,
        errorCodes: data['error-codes'] || []
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Verification failed' })
    };
  }
};


