import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const sig = searchParams.get('sig');

    if (!id) {
      return NextResponse.json({ status: 'INVALID', error: 'Missing required parameter: id' }, { status: 400 });
    }

    // 1. Fetch certificate from DB
    const record = await prisma.certificate.findUnique({
      where: { certId: id }
    });

    if (!record) {
      return NextResponse.json({
        status: 'INVALID',
        error: 'Certificate ID not found in registry (REGISTRY_MISS)'
      }, { status: 404 });
    }

    // 2. Cryptographic Validation (if sig is provided)
    if (sig && record.signature !== sig) {
      return NextResponse.json({
        status: 'INVALID',
        error: 'Cryptographic signature mismatch (INTEGRITY_FAILURE)'
      }, { status: 401 });
    }

    // SUCCESS!
    return NextResponse.json({
      status: 'VERIFIED',
      certId: id,
      name: record.name,
      issueDate: record.issuedAt,
      statusMessage: record.status
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'ERROR', error: error.message }, { status: 500 });
  }
}
