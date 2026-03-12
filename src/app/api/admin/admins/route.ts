import { NextRequest, NextResponse } from 'next/server';
import { getAdmins, createAdmin, updateAdminStatus, deleteAdmin } from '@/lib/services/adminService';
import { requireRole } from '@/lib/adminAuth';

export async function GET() {
  try {
    await requireRole('super');
    const data = await getAdmins();
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole('super');
    const { username, password, role } = await req.json();
    const data = await createAdmin(username, password, role);
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole('super');
    const { id, is_active } = await req.json();
    await updateAdminStatus(Number(id), is_active);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole('super');
    const { id } = await req.json();
    await deleteAdmin(Number(id));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
