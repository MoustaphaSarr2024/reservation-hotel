#!/bin/bash

echo "1. Listing all reservations..."
curl -s http://localhost:3000/api/reservations | grep -o 'guestName'
echo -e "\n"

echo "2. Checking availability (should be false for 2024-01-02)..."
curl -s "http://localhost:3000/api/reservations/availability?roomId=1&dateFrom=2024-01-02&dateTo=2024-01-03"
echo -e "\n"

echo "3. Checking availability (should be true for 2024-02-01)..."
curl -s "http://localhost:3000/api/reservations/availability?roomId=1&dateFrom=2024-02-01&dateTo=2024-02-05"
echo -e "\n"

echo "4. Updating reservation 2 (Bob Smith -> Bob Jones)..."
curl -X PUT http://localhost:3000/api/reservations/2 \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Bob Jones"
  }'
echo -e "\n"

echo "5. Deleting reservation 2..."
curl -X DELETE http://localhost:3000/api/reservations/2
echo -e "\n"

echo "6. Verifying deletion..."
curl -s http://localhost:3000/api/reservations | grep -o 'Bob Jones' || echo "Bob Jones not found (Good)"
echo -e "\n"
