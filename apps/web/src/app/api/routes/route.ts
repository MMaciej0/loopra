import { NextResponse } from 'next/server';
import { MAX_GPX_FILE_SIZE_BYTES } from '@loopra/domain';
import { protectedRequest } from '@/utils/api';
import { APP_ERROR_TYPES } from '@/utils/errors';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ type: APP_ERROR_TYPES.FILE_REQUIRED }, { status: 400 });
  }

  if (file.size > MAX_GPX_FILE_SIZE_BYTES) {
    return NextResponse.json({ type: APP_ERROR_TYPES.FILE_TOO_LARGE }, { status: 413 });
  }

  const response = await protectedRequest('/routes', { method: 'POST', body: formData });

  if (!response.ok) {
    return NextResponse.json({ type: response.errorType }, { status: 400 });
  }

  return NextResponse.json(response.data);
}
