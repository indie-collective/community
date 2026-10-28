// The API's OpenAPI description (#349).
import { openApi } from '../../utils/openApi';
import getOrigin from '../../utils/origin.server';

export const loader = ({ request }) =>
  new Response(JSON.stringify(openApi(getOrigin(request)), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
