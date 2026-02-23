import { NextResponse } from 'next/server';
import { getRobotById, updateRobot, deleteRobot } from '@/lib/api/robots';
import type { UpdateRobotInput } from '@/lib/types/database';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const result = await getRobotById(parseInt(id, 10));
    return NextResponse.json(result);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body: UpdateRobotInput = await request.json();
    const result = await updateRobot(parseInt(id, 10), body);
    return NextResponse.json(result);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const result = await deleteRobot(parseInt(id, 10));
    return NextResponse.json(result);
}
