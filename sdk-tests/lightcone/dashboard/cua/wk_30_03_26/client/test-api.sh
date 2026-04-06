#!/bin/bash

# Test script for API routes
# Make sure the Next.js dev server is running (pnpm dev or npm run dev)

BASE_URL="http://localhost:3000/api"

echo "========================================"
echo "Testing API Routes"
echo "========================================"
echo ""

# Test 1: List all results
echo "1. Testing GET /api/results"
echo "-------------------------------------------"
curl -s "${BASE_URL}/results" | jq '.'
echo ""
echo ""

# Test 2: Get specific result
echo "2. Testing GET /api/results?id=home_completions"
echo "-------------------------------------------"
curl -s "${BASE_URL}/results?id=home_completions" | jq '.'
echo ""
echo ""

# Test 3: List screenshots
echo "3. Testing GET /api/screenshots"
echo "-------------------------------------------"
curl -s "${BASE_URL}/screenshots" | jq '.'
echo ""
echo ""

# Test 4: List log files
echo "4. Testing GET /api/logs"
echo "-------------------------------------------"
curl -s "${BASE_URL}/logs" | jq '.'
echo ""
echo ""

# Test 5: Read specific log file (first page)
echo "5. Testing GET /api/logs?file=<filename>&page=1&limit=10"
echo "-------------------------------------------"
# Get the first log file from the list
LOG_FILE=$(curl -s "${BASE_URL}/logs" | jq -r '.data[0].filename')
if [ "$LOG_FILE" != "null" ]; then
  echo "Reading first 10 lines of: $LOG_FILE"
  curl -s "${BASE_URL}/logs?file=${LOG_FILE}&page=1&limit=10" | jq '.'
else
  echo "No log files found"
fi
echo ""
echo ""

echo "========================================"
echo "Tests Complete"
echo "========================================"
