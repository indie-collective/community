// Identity resolution that runs on Node and Cloudflare Workers alike (#155).
// The stock resolvers call fetch with `redirect: 'error'`, which Workers
// reject outright; these use 'manual' and treat a redirect as a failure.
const getJson = async (url, accept = 'application/json') => {
  const response = await fetch(url, { redirect: 'manual', headers: { accept } });
  if (response.status !== 200) throw new Error(`${url} answered ${response.status}`);
  return response.json();
};

export const edgeDidResolver = {
  async resolve(did) {
    if (did.startsWith('did:plc:')) return getJson(`https://plc.directory/${encodeURIComponent(did)}`, 'application/did+ld+json,application/json');
    if (did.startsWith('did:web:')) return getJson(`https://${did.slice('did:web:'.length)}/.well-known/did.json`);
    throw new Error(`Unsupported DID method: ${did}`);
  },
};

const DID = /^did:(plc|web):[a-zA-Z0-9._:%-]+$/;
export const edgeHandleResolver = {
  async resolve(handle) {
    // DNS TXT _atproto.<handle> over DNS-over-HTTPS, then HTTPS well-known.
    const dns = await getJson(`https://cloudflare-dns.com/dns-query?name=_atproto.${handle}&type=TXT`, 'application/dns-json').catch(() => null);
    for (const { data } of dns?.Answer ?? []) {
      const did = data.replace(/^"|"$/g, '').replace(/^did=/, '');
      if (DID.test(did)) return did;
    }
    const response = await fetch(`https://${handle}/.well-known/atproto-did`, { redirect: 'manual' }).catch(() => null);
    const did = response?.status === 200 ? (await response.text()).trim() : null;
    return did && DID.test(did) ? did : null;
  },
};
