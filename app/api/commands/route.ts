import { NextResponse } from 'next/server';
import { getCommandLogs, getErrorCount, getActivityData } from '@/lib/api/commands';
import { getActivityLogs as getActivityLogsFromDB } from '@/lib/api/activityLog';
import { query } from '@/lib/dbClient';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const deviceId = searchParams.get('deviceId');
    const limit = parseInt(searchParams.get('limit') ?? '5', 10);

    if (action === 'error-count') {
        const result = await getErrorCount();
        return NextResponse.json(result);
    }

    if (action === 'activity' && deviceId) {
        const result = await getActivityData(parseInt(deviceId, 10));
        return NextResponse.json(result);
    }

    // Get robot-specific error count
    if (action === 'robot-error-count' && deviceId) {
        try {
            const rows = await query<{ count: string }>(
                `SELECT COUNT(*) as count 
                 FROM h_command_log 
                 WHERE device_id = $1 AND status != 'success'`,
                [parseInt(deviceId, 10)]
            );
            return NextResponse.json({
                data: parseInt(rows[0]?.count ?? '0', 10),
                error: null
            });
        } catch (err: unknown) {
            const error = err as Error;
            return NextResponse.json({ data: 0, error: error.message });
        }
    }

    // Get activity logs with sentiment analysis
    if (action === 'activity-logs') {
        const result = await getActivityLogsFromDB(
            limit,
            deviceId ? parseInt(deviceId, 10) : undefined
        );
        return NextResponse.json(result);
    }

    const result = await getCommandLogs(limit, deviceId ? parseInt(deviceId, 10) : undefined);
    return NextResponse.json(result);
}
