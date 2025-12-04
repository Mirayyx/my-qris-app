import { NextResponse } from 'next/server';
import { convertQris } from '@/utils/qris';

export async function POST(request) {
  try {
    const body = await request.json();
    const { qris, amount } = body;

    if (!qris || !amount) {
      return NextResponse.json(
        { status: false, error: 'Parameter qris dan amount wajib diisi.' },
        { status: 400 }
      );
    }

    const qrisDynamic = convertQris(qris, amount);

    return NextResponse.json({
      status: true,
      data: {
        qris_original: qris,
        amount: amount,
        qris_modified: qrisDynamic
      },
      creator: "Ray QRIS Tools"
    });

  } catch (error) {
    return NextResponse.json(
      { status: false, error: error.message },
      { status: 500 }
    );
  }
}
