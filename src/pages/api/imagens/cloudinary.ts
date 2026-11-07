import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
  const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return new Response(
      JSON.stringify({ error: 'Credenciais do Cloudinary não configuradas' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = await request.json() as {
      file?: string;
      fileName?: string;
      sku?: string;
    };

    if (!body.file?.startsWith('data:image/jpeg;base64,') &&
        !body.file?.startsWith('data:image/png;base64,') &&
        !body.file?.startsWith('data:image/webp;base64,')) {
      return new Response(
        JSON.stringify({ error: 'Envie uma imagem JPG, PNG ou WEBP' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const base64Length = body.file.length - body.file.indexOf(',') - 1;
    if (base64Length * 0.75 > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'A imagem deve ter no máximo 8 MB' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } },
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const sku = body.sku?.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
    const uploadId = `${Date.now()}-${crypto.randomUUID()}`;
    const publicId = sku ? `guidon-rodas/produtos/${sku}-${uploadId}` : undefined;
    const result = await cloudinary.uploader.upload(body.file, {
      folder: sku ? undefined : 'guidon-rodas/produtos',
      public_id: publicId,
      resource_type: 'image',
      transformation: [
        { width: 1600, height: 1600, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return new Response(JSON.stringify({
      url: result.secure_url,
      publicId: result.public_id,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao enviar imagem';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
