import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/settings';
import { manualConnectWs, disconnectWs } from '@/lib/wsClient';
import { getCurrentUser } from '@/lib/api/auth';

export async function GET() {
    try {
        const settings = getSettings();
        return NextResponse.json({
            success: true,
            isWsTurnedOn: settings.isWsTurnedOn || false,
            activeUserEmail: settings.activeUserEmail || null
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const action = body.action;

        const userResponse = await getCurrentUser();
        const user = userResponse.data;

        if (!user || !user.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const settings = getSettings();

        if (action === 'turn-on') {
            if (settings.isWsTurnedOn && settings.activeUserEmail && settings.activeUserEmail !== user.email) {
                return NextResponse.json({ success: false, error: `WebSocket is already in use by ${settings.activeUserEmail}` }, { status: 403 });
            }

            saveSettings({
                isWsTurnedOn: true,
                activeUserEmail: user.email
            });

            await manualConnectWs();
            return NextResponse.json({ success: true, message: 'WebSocket turned on successfully', activeUserEmail: user.email });
        }

        if (action === 'turn-off') {
            if (settings.isWsTurnedOn && settings.activeUserEmail && settings.activeUserEmail !== user.email) {
                // Determine if we allow an override. For now, strict lock.
                return NextResponse.json({ success: false, error: `Cannot turn off. Session is owned by ${settings.activeUserEmail}` }, { status: 403 });
            }

            saveSettings({
                isWsTurnedOn: false,
                activeUserEmail: null
            });

            disconnectWs();
            return NextResponse.json({ success: true, message: 'WebSocket turned off successfully' });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
