import { NextResponse } from 'next/server';
import { signIn, signUp, signOut, getCurrentUser, updateUserProfile } from '@/lib/api/auth';

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    if (action === 'signin') {
        const result = await signIn(body.email, body.password);
        return NextResponse.json(result);
    }

    if (action === 'signup') {
        const result = await signUp(body.email, body.password, body.role);
        return NextResponse.json(result);
    }

    if (action === 'signout') {
        const result = await signOut();
        return NextResponse.json(result);
    }

    if (action === 'update-profile') {
        const result = await updateUserProfile(body);
        return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET() {
    const result = await getCurrentUser();
    return NextResponse.json(result);
}
