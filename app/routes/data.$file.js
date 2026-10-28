// An open data export file (#304), from the bucket.
import { exportFile } from '../data/openData.server';

export async function loader({ params }) {
  const response = await exportFile(params.file);
  if (!response) throw new Response('Not Found', { status: 404 });
  return response;
}
