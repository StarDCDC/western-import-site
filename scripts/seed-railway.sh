#!/usr/bin/env bash
# Export data from SQLite and seed Railway PostgreSQL via API
set -e

SITE="https://exquisite-spontaneity-production-183c.up.railway.app"
SECRET="western-import-2026-prod-secret-key"
DB="prisma/dev.db"

echo "📦 Exporting data from SQLite..."

python3 -c "
import sqlite3, json, sys

db = sqlite3.connect('$DB')
db.row_factory = sqlite3.Row

def q(sql):
    rows = [dict(r) for r in db.execute(sql).fetchall()]
    # Convert non-serializable types
    for row in rows:
        for k, v in row.items():
            if v is None: continue
            if isinstance(v, bytes): row[k] = v.decode('utf-8', errors='replace')
    return rows

data = {
    'admin': {'id': 'admin_001', 'email': 'freemen92@gmail.com', 'name': 'Admin Western Import', 'role': 'ADMIN', 'phone': '+37369466585'},
    'categories': q('SELECT * FROM categories'),
    'brands': q('SELECT * FROM brands'),
    'settings': q('SELECT * FROM settings'),
    'banners': q('SELECT * FROM banners'),
    'faqs': q('SELECT * FROM faqs'),
    'workSchedule': q('SELECT * FROM work_schedule'),
}

# Products with specs
products = q('SELECT * FROM products')
specs = {s['productId']: s for s in q('SELECT * FROM product_specs')}
for p in products:
    sp = specs.get(p['id'])
    if sp:
        p['spec'] = sp

data['products'] = products

json.dump(data, sys.stdout, ensure_ascii=False)
db.close()
" > /tmp/seed_data.json

SIZE=$(wc -c < /tmp/seed_data.json)
echo "📦 Exported ${SIZE} bytes"

echo "🚀 Seeding Railway PostgreSQL..."
HTTP_CODE=$(curl -s -o /tmp/seed_result.json -w "%{http_code}" \
  -X POST "$SITE/api/admin/seed" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET" \
  -d @/tmp/seed_data.json)

echo "HTTP $HTTP_CODE"
cat /tmp/seed_result.json | python3 -m json.tool 2>/dev/null || cat /tmp/seed_result.json
