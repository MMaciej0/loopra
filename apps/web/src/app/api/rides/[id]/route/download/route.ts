import { NextResponse, type NextRequest } from 'next/server';
import { APP_ERROR_TYPES } from '@loopra/domain';
import { DownloadRouteResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';

const NOT_FOUND_TYPES: string[] = [
  APP_ERROR_TYPES.RIDE_NOT_FOUND,
  APP_ERROR_TYPES.ROUTE_NOT_FOUND,
  APP_ERROR_TYPES.PARTICIPANT_NOT_FOUND,
];

export async function GET(
  _req: NextRequest,
  context: RouteContext<'/api/rides/[id]/route/download'>,
) {
  const { id } = await context.params;

  const response = await protectedRequest(`/rides/${id}/route/download`, {
    schema: DownloadRouteResponseSchema,
  });

  if (!response.ok) {
    const status = NOT_FOUND_TYPES.includes(response.errorType) ? 404 : 400;
    return NextResponse.json({ type: response.errorType }, { status });
  }

  return NextResponse.redirect(response.data.data.url);
}
