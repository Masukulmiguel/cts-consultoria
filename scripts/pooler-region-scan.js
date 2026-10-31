const { Client } = require('pg');
const regions = [
  'aws-0-us-east-1',
  'aws-0-us-east-2',
  'aws-0-us-west-1',
  'aws-0-us-west-2',
  'aws-0-eu-west-1',
  'aws-0-eu-west-2',
  'aws-0-eu-west-3',
  'aws-0-eu-central-1',
  'aws-0-eu-central-2',
  'aws-0-ap-southeast-1',
  'aws-0-ap-southeast-2',
  'aws-0-ap-northeast-1',
  'aws-0-ap-northeast-2',
  'aws-0-ap-south-1',
  'aws-0-sa-east-1',
  'aws-0-ca-central-1',
  'aws-1-us-east-1',
  'aws-1-us-east-2',
  'aws-1-us-west-1',
  'aws-1-us-west-2',
  'aws-1-eu-west-1',
  'aws-1-eu-west-2',
  'aws-1-eu-west-3',
  'aws-1-eu-central-1',
  'aws-1-eu-central-2',
  'aws-1-ap-southeast-1',
  'aws-1-ap-southeast-2',
  'aws-1-ap-northeast-1',
  'aws-1-ap-northeast-2',
  'aws-1-ap-south-1',
  'aws-1-sa-east-1',
  'aws-1-ca-central-1',
];
const ref = process.argv[2];
const pwd = process.argv[3];

async function test(host) {
  const c = new Client({
    host: `${host}.pooler.supabase.com`,
    port: 6543,
    user: `postgres.${ref}`,
    password: pwd,
    database: 'postgres',
    connectionTimeoutMillis: 6000,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await c.connect();
    const r = await c.query('select current_database()');
    await c.end();
    return `${host}: SUCCESS (${r.rows[0].current_database})`;
  } catch (e) {
    try {
      await c.end();
    } catch {}
    return `${host}: ${e.message}`;
  }
}

(async () => {
  const results = await Promise.all(regions.map(test));
  for (const r of results) {
    if (!r.includes('tenant or user not found') || r.includes('SUCCESS')) console.log(r);
  }
  console.log('--- tested:', results.length);
})();
