import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import StoreClient from '@/components/StoreClient';

// The original hand-built markup, kept byte-identical. Read on the server so the
// ~2MB of inline base64 images never enters the client JS bundle.
const storefrontHtml = readFileSync(join(process.cwd(), 'app', 'storefront-body.html'), 'utf8');

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: storefrontHtml }} />
      <StoreClient />
    </>
  );
}
