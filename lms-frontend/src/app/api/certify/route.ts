import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';
const DEFAULT_USER_ID = "student_1";
const CERT_SECRET = process.env.CERT_SECRET || 'ana-industrial-authority-secret-2026';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const { name, path = 'all' } = await request.json();
    const candidateName = name || "Test Student";

    // 1. Verify progress: check if at least 1 module is completed with full score
    const progressCount = await prisma.userProgress.count({
      where: { user_id: userId, score: { gte: 100 } }
    });

    if (progressCount < 1) {
      return NextResponse.json({
        success: false,
        error: "Incomplete Mastery",
        message: `You have completed ${progressCount} modules. Complete at least 1 module to claim certification for testing.`
      }, { status: 403 });
    }

    // 2. Check if already certified for this path
    let cert = await prisma.certificate.findFirst({
      where: { user_id: userId, path: path }
    });

    if (cert) {
      return NextResponse.json(cert);
    }

    // 3. Generate Certificate ID
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const prefixMap: Record<string, string> = {
      'all': 'ALL',
      'foundations': 'FND',
      'enterprise': 'ENT',
      'regulated': 'REG'
    };
    const prefix = prefixMap[path as string] || 'ALL';
    const certId = `ANA-UI-${prefix}-${year}-${rand}`;

    // 4. Calculate average score
    const allProgress = await prisma.userProgress.findMany({
      where: { user_id: userId }
    });
    const avgScore = allProgress.length > 0 
      ? Math.round(allProgress.reduce((acc, p) => acc + p.score, 0) / allProgress.length)
      : 100;

    // 5. Generate Verifiable HMAC Signature
    const issuedAt = new Date().toISOString();
    const modulesVersion = '1.5.0';
    const dataToSign = `${userId}|${certId}|${avgScore}|${issuedAt}|${modulesVersion}`;
    const hash_signature = crypto
      .createHmac('sha256', CERT_SECRET)
      .update(dataToSign)
      .digest('hex');

    // 6. Create in DB
    cert = await prisma.certificate.create({
      data: {
        certId,
        name: candidateName,
        path: path,
        completionPercentage: 100,
        signature: hash_signature,
        user: { connect: { id: userId } },
        hash_signature: hash_signature,
        validation_url: `/verify/${certId}`,
        issuedAt: new Date(issuedAt)
      }
    });

    return NextResponse.json(cert);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
