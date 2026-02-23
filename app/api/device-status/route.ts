import { NextResponse } from 'next/server';
import { getAllDeviceStatus, getLowBatteryDevices, getDevicesByMode } from '@/lib/api/deviceStatus';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const mode = searchParams.get('mode');

    if (action === 'low-battery') {
        const result = await getLowBatteryDevices();
        return NextResponse.json(result);
    }

    if (action === 'by-mode' && mode) {
        const result = await getDevicesByMode(mode);
        return NextResponse.json(result);
    }

    // Get active robots (status updated within 5 minutes)
    if (action === 'active') {
        const { data, error } = await getAllDeviceStatus();
        if (error || !data) {
            return NextResponse.json({ data: null, error });
        }

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const activeDevices = data.filter(d => {
            if (!d.status_updated_at) return false;
            return new Date(d.status_updated_at) > fiveMinutesAgo;
        });

        return NextResponse.json({ data: activeDevices, error: null });
    }

    // Get inactive robots (no status update within 5 minutes)
    if (action === 'inactive') {
        const { data, error } = await getAllDeviceStatus();
        if (error || !data) {
            return NextResponse.json({ data: null, error });
        }

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const inactiveDevices = data.filter(d => {
            if (!d.status_updated_at) return true;
            return new Date(d.status_updated_at) <= fiveMinutesAgo;
        });

        return NextResponse.json({ data: inactiveDevices, error: null });
    }

    const result = await getAllDeviceStatus();
    return NextResponse.json(result);
}
