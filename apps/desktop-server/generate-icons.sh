#!/bin/bash

# Script to generate app icons for macOS, Windows, and Linux
# Requires: sips (macOS built-in), iconutil (macOS built-in)
# For Windows .ico, we'll create the PNG files and document manual conversion

set -e

echo "🎨 Generating BizFlow Server app icons..."

# Source icon (1024x1024)
SOURCE_ICON="build/icon-1024.png"

if [ ! -f "$SOURCE_ICON" ]; then
  echo "❌ Error: Source icon not found at $SOURCE_ICON"
  exit 1
fi

# Create directories
mkdir -p build/icons
mkdir -p build/icon.iconset

echo "📱 Generating macOS icons (.icns)..."

# Generate all required sizes for macOS iconset
sips -s format png -z 16 16     "$SOURCE_ICON" --out build/icon.iconset/icon_16x16.png
sips -s format png -z 32 32     "$SOURCE_ICON" --out build/icon.iconset/icon_16x16@2x.png
sips -s format png -z 32 32     "$SOURCE_ICON" --out build/icon.iconset/icon_32x32.png
sips -s format png -z 64 64     "$SOURCE_ICON" --out build/icon.iconset/icon_32x32@2x.png
sips -s format png -z 128 128   "$SOURCE_ICON" --out build/icon.iconset/icon_128x128.png
sips -s format png -z 256 256   "$SOURCE_ICON" --out build/icon.iconset/icon_128x128@2x.png
sips -s format png -z 256 256   "$SOURCE_ICON" --out build/icon.iconset/icon_256x256.png
sips -s format png -z 512 512   "$SOURCE_ICON" --out build/icon.iconset/icon_256x256@2x.png
sips -s format png -z 512 512   "$SOURCE_ICON" --out build/icon.iconset/icon_512x512.png
sips -s format png -z 1024 1024 "$SOURCE_ICON" --out build/icon.iconset/icon_512x512@2x.png

# Convert iconset to icns
iconutil -c icns build/icon.iconset -o build/icon.icns

echo "✅ macOS icon created: build/icon.icns"

echo "🐧 Generating Linux icons (PNG)..."

# Generate Linux icon sizes
sips -s format png -z 16 16     "$SOURCE_ICON" --out build/icons/16x16.png
sips -s format png -z 24 24     "$SOURCE_ICON" --out build/icons/24x24.png
sips -s format png -z 32 32     "$SOURCE_ICON" --out build/icons/32x32.png
sips -s format png -z 48 48     "$SOURCE_ICON" --out build/icons/48x48.png
sips -s format png -z 64 64     "$SOURCE_ICON" --out build/icons/64x64.png
sips -s format png -z 96 96     "$SOURCE_ICON" --out build/icons/96x96.png
sips -s format png -z 128 128   "$SOURCE_ICON" --out build/icons/128x128.png
sips -s format png -z 256 256   "$SOURCE_ICON" --out build/icons/256x256.png
sips -s format png -z 512 512   "$SOURCE_ICON" --out build/icons/512x512.png
sips -s format png -z 1024 1024 "$SOURCE_ICON" --out build/icons/1024x1024.png

echo "✅ Linux icons created in: build/icons/"

echo "🪟 Generating Windows icon files (PNG)..."

# Generate Windows icon sizes (will be converted to .ico manually or via online tool)
mkdir -p build/windows-icons
sips -s format png -z 16 16     "$SOURCE_ICON" --out build/windows-icons/icon-16.png
sips -s format png -z 24 24     "$SOURCE_ICON" --out build/windows-icons/icon-24.png
sips -s format png -z 32 32     "$SOURCE_ICON" --out build/windows-icons/icon-32.png
sips -s format png -z 48 48     "$SOURCE_ICON" --out build/windows-icons/icon-48.png
sips -s format png -z 64 64     "$SOURCE_ICON" --out build/windows-icons/icon-64.png
sips -s format png -z 128 128   "$SOURCE_ICON" --out build/windows-icons/icon-128.png
sips -s format png -z 256 256   "$SOURCE_ICON" --out build/windows-icons/icon-256.png

echo "✅ Windows PNG icons created in: build/windows-icons/"
echo ""
echo "⚠️  For Windows .ico file:"
echo "   Option 1: Use online converter (recommended):"
echo "   - Visit: https://convertio.co/png-ico/"
echo "   - Upload: build/windows-icons/icon-256.png"
echo "   - Download as: build/icon.ico"
echo ""
echo "   Option 2: Use ImageMagick (if installed):"
echo "   - Run: convert build/windows-icons/icon-*.png build/icon.ico"
echo ""

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
  echo "🔧 ImageMagick detected! Creating .ico file..."
  convert build/windows-icons/icon-16.png \
          build/windows-icons/icon-32.png \
          build/windows-icons/icon-48.png \
          build/windows-icons/icon-64.png \
          build/windows-icons/icon-128.png \
          build/windows-icons/icon-256.png \
          build/icon.ico
  echo "✅ Windows icon created: build/icon.ico"
else
  echo "ℹ️  ImageMagick not found. Please create .ico manually."
fi

echo ""
echo "🎉 Icon generation complete!"
echo ""
echo "Generated files:"
echo "  - build/icon.icns (macOS)"
echo "  - build/icons/*.png (Linux)"
echo "  - build/icon.ico (Windows - if ImageMagick available)"
echo ""
echo "You can now run: pnpm package"
