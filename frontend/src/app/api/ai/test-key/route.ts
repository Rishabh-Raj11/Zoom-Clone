import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({ success: false, message: 'API key is required.' }, { status: 400 });
    }

    const cleanKey = apiKey.trim();
    const testRes = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${cleanKey}` },
    });

    if (testRes.ok) {
      const data = await testRes.json();
      return NextResponse.json({
        success: true,
        message: 'OpenAI API key verified successfully! Connected.',
        modelsCount: data.data?.length || 0,
      });
    } else {
      const errData = await testRes.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        message: errData.error?.message || 'Invalid API key or unauthorized by OpenAI.',
      }, { status: 401 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Connection failed' }, { status: 500 });
  }
}
