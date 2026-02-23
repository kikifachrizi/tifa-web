import { NextResponse } from 'next/server';
import { getGoalsByMap, getActiveGoalQueues, countGoalsByType, getGoalQueue } from '@/lib/api/goals';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const mapId = searchParams.get('mapId');
    const deviceId = searchParams.get('deviceId');

    if (action === 'by-map' && mapId) {
        const result = await getGoalsByMap(parseInt(mapId, 10));
        return NextResponse.json(result);
    }

    if (action === 'active-queues') {
        const result = await getActiveGoalQueues();
        return NextResponse.json(result);
    }

    if (action === 'count-by-type') {
        const result = await countGoalsByType();
        return NextResponse.json(result);
    }

    if (action === 'queue' && deviceId) {
        const result = await getGoalQueue(parseInt(deviceId, 10));
        return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 });
}
