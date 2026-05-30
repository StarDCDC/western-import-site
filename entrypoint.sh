#!/bin/sh
# Run DB migrations in background, start app immediately
npx prisma db push --accept-data-loss > /dev/null 2>&1 &
exec npm start
