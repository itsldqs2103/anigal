import db from '../../../lib/db';
import { download } from '../../../lib/download';
import { del } from '@vercel/blob';

export const runtime = 'nodejs';

export async function GET() {
    const rows = await db`
        SELECT id, path, created_at, updated_at
        FROM images
        ORDER BY created_at DESC
    `;

    return new Response(JSON.stringify(rows), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return new Response(
                JSON.stringify({ error: 'Missing URL' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const blobUrl = await download(url);

        const [row] = await db`
            INSERT INTO images (path)
            VALUES (${blobUrl})
            RETURNING id, path, created_at, updated_at
        `;

        return new Response(
            JSON.stringify(row),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        console.error(err);

        return new Response(
            JSON.stringify({ error: 'Failed to process image' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function PUT(request) {
    const { id, url } = await request.json();

    if (!id || !url) {
        return new Response(
            JSON.stringify({ error: 'Missing id or url' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const [old] = await db`
        SELECT path
        FROM images
        WHERE id = ${id}
    `;

    if (!old) {
        return new Response(
            JSON.stringify({ error: 'Not found' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }

    await del(old.path);

    const newBlobUrl = await download(url);

    const [updated] = await db`
        UPDATE images
        SET path = ${newBlobUrl}, updated_at = now()
        WHERE id = ${id}
        RETURNING id, path, created_at, updated_at
    `;

    return new Response(
        JSON.stringify(updated),
        { headers: { 'Content-Type': 'application/json' } }
    );
}

export async function DELETE(request) {
    const { id } = await request.json();

    if (!id) {
        return new Response(
            JSON.stringify({ error: 'Missing id' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const [row] = await db`
        SELECT path
        FROM images
        WHERE id = ${id}
    `;

    if (!row) {
        return new Response(
            JSON.stringify({ error: 'Not found' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }

    await del(row.path);

    await db`
        DELETE FROM images
        WHERE id = ${id}
    `;

    return new Response(
        JSON.stringify({ id }),
        { headers: { 'Content-Type': 'application/json' } }
    );
}
