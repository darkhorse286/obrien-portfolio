import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      { error: 'Web3Forms access key is not configured.' },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Missing required form fields.' },
      { status: 400 }
    );
  }

  const formData = new URLSearchParams();
  formData.append('access_key', accessKey);
  formData.append('subject', 'New Contact from obrienandson.com');
  formData.append('from_name', "O'Brien & Son Contact Form");
  formData.append('name', String(name));
  formData.append('email', String(email));
  formData.append('message', String(message));

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to submit contact form.', details: errorText },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to submit contact form.', details: String(error) },
      { status: 500 }
    );
  }
}
