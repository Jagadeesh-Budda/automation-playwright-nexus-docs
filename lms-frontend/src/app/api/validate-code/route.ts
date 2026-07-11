import { NextResponse } from 'next/server';
import modulesMetadata from '../../../data/metadata.json';
import { validateCode } from '../../../utils/validatorEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, moduleId, taskIndex } = body;

    if (!code) {
      return NextResponse.json({ valid: false, issues: ['No code provided.'] }, { status: 400 });
    }

    const meta = modulesMetadata.find((m: any) => m.id === moduleId);
    if (!meta) {
      return NextResponse.json({ valid: false, issues: ['Invalid moduleId.'] }, { status: 400 });
    }

    // Dynamically import the specific module content containing the tasks/rules
    const moduleContent = await import(`../../../data/modules/${meta.moduleFile}.json`);
    const mod = moduleContent.default || moduleContent;
    const lesson = mod.lessons?.find((l: any) => l.id === moduleId);

    // Get the tasks list, optionally filtering by taskIndex if provided
    let tasks = lesson?.tasks || [];
    if (typeof taskIndex === 'number') {
      tasks = tasks[taskIndex] ? [tasks[taskIndex]] : [];
    }

    // Recreate the minimal module object structure expected by validateCode
    const targetModule = {
      ...meta,
      tasks
    };

    const { valid, issues, message } = validateCode(code, moduleId, [targetModule]);

    if (!valid) {
      return NextResponse.json({ valid: false, issues });
    }

    return NextResponse.json({ valid: true, message });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ valid: false, issues: [message] }, { status: 500 });
  }
}
