#!/bin/bash

echo "1. Creating first reservation (2024-01-01 to 2024-01-05)..."
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "roomId": 1,
    "dateFrom": "2024-01-01",
    "dateTo": "2024-01-05"
  }'
echo -e "\n"

echo "2. Attempting overlapping reservation (2024-01-03 to 2024-01-07)..."
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Jane Doe",
    "guestEmail": "jane@example.com",
    "roomId": 1,
    "dateFrom": "2024-01-03",
    "dateTo": "2024-01-07"
  }'
echo -e "\n"

echo "3. Creating non-overlapping reservation (2024-01-06 to 2024-01-10)..."
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Bob Smith",
    "guestEmail": "bob@example.com",
    "roomId": 1,
    "dateFrom": "2024-01-06",
    "dateTo": "2024-01-10"
  }'
echo -e "\n"
