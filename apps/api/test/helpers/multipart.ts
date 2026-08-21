export const buildFileUpload = async (
  body: Buffer,
  filename: string,
  contentType = 'application/gpx+xml',
) => {
  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(body)], { type: contentType }), filename);

  const encoded = new Response(form);

  return {
    payload: Buffer.from(await encoded.arrayBuffer()),
    headers: { 'content-type': encoded.headers.get('content-type') as string },
  };
};
