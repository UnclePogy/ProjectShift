#!/bin/bash

echo "📦 Exporting Project Shift..."

zip -r ../ProjectShift-current.zip . \
  -x ".git/*" \
     ".DS_Store" \
     "*/.DS_Store"

echo ""
echo "✅ Export complete:"
echo "../ProjectShift-current.zip"