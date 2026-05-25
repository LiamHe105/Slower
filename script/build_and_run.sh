#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NATIVE_DIR="$ROOT_DIR/native"
APP_NAME="Slower"
PRODUCT_NAME="FocusAssistant"
DIST_DIR="$ROOT_DIR/dist"
APP_BUNDLE="$DIST_DIR/$APP_NAME.app"
EXEC_PATH="$NATIVE_DIR/.build/arm64-apple-macosx/debug/$PRODUCT_NAME"
BUNDLE_EXECUTABLE="FocusAssistant"
BUILD_CACHE_DIR="$NATIVE_DIR/.build/cache"
ICON_FILE="$NATIVE_DIR/Resources/AppIcon.icns"

mkdir -p "$BUILD_CACHE_DIR/clang" "$BUILD_CACHE_DIR/swiftpm" "$DIST_DIR"
export CLANG_MODULE_CACHE_PATH="$BUILD_CACHE_DIR/clang"
export SWIFTPM_HOME="$BUILD_CACHE_DIR/swiftpm"
export HOME="$BUILD_CACHE_DIR/home"
mkdir -p "$HOME"

pkill -x "$PRODUCT_NAME" 2>/dev/null || true
pkill -x "专注助手" 2>/dev/null || true
pkill -x "Slower" 2>/dev/null || true

cd "$NATIVE_DIR"
swift build --disable-sandbox --scratch-path "$NATIVE_DIR/.build"

rm -rf "$APP_BUNDLE"
mkdir -p "$APP_BUNDLE/Contents/MacOS" "$APP_BUNDLE/Contents/Resources"
cp "$EXEC_PATH" "$APP_BUNDLE/Contents/MacOS/$BUNDLE_EXECUTABLE"
if [[ -f "$ICON_FILE" ]]; then
  cp "$ICON_FILE" "$APP_BUNDLE/Contents/Resources/AppIcon.icns"
fi
chmod +x "$APP_BUNDLE/Contents/MacOS/$BUNDLE_EXECUTABLE"
printf "APPL????" > "$APP_BUNDLE/Contents/PkgInfo"

cat > "$APP_BUNDLE/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>$BUNDLE_EXECUTABLE</string>
  <key>CFBundleIdentifier</key>
  <string>top.liamhe.focusassistant</string>
  <key>CFBundleName</key>
  <string>Slower</string>
  <key>CFBundleDisplayName</key>
  <string>Slower</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>0.1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSMinimumSystemVersion</key>
  <string>14.0</string>
  <key>NSPrincipalClass</key>
  <string>NSApplication</string>
</dict>
</plist>
PLIST

codesign --force --deep --sign - "$APP_BUNDLE" >/dev/null 2>&1 || true

if ! /usr/bin/open -n "$APP_BUNDLE"; then
  echo "Built $APP_BUNDLE"
  echo "Automatic launch failed in this shell. Open the app from Finder or run this script in Terminal."
  exit 0
fi

if [[ "${1:-}" == "--verify" ]]; then
  sleep 1
  if pgrep -x "$PRODUCT_NAME" >/dev/null 2>&1; then
    echo "Launched $APP_BUNDLE"
  else
    echo "Built $APP_BUNDLE; process verification is unavailable in this shell."
  fi
fi
