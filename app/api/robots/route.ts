import { NextResponse } from 'next/server';
import { getRobots, getRecentRobots, getRobotCount, createRobot } from '@/lib/api/robots';
import type { CreateRobotInput } from '@/lib/types/database';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? undefined;
    const action = searchParams.get('action');

    if (action === 'recent') {
        const limit = parseInt(searchParams.get('limit') ?? '5', 10);
        const result = await getRecentRobots(limit);
        return NextResponse.json(result);
    }

    if (action === 'count') {
        const result = await getRobotCount();
        return NextResponse.json(result);
    }

    const result = await getRobots(search);
    return NextResponse.json(result);
}

export async function POST(request: Request) {
    const body: CreateRobotInput = await request.json();
    const result = await createRobot(body);
    return NextResponse.json(result);
}

