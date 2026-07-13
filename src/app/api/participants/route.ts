import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
    
    if (!scriptUrl) {
      return NextResponse.json({ status: 'error', message: 'Script URL not configured' }, { status: 500 });
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'getParticipants' }),
      cache: 'no-store'
    });

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
