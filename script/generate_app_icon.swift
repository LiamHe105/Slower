import AppKit
import Foundation

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let resources = root.appendingPathComponent("native/Resources", isDirectory: true)
let iconset = resources.appendingPathComponent("AppIcon.iconset", isDirectory: true)
let output = resources.appendingPathComponent("AppIcon.icns")

try? FileManager.default.removeItem(at: iconset)
try FileManager.default.createDirectory(at: iconset, withIntermediateDirectories: true)

let sizes: [(String, CGFloat)] = [
    ("icon_16x16.png", 16),
    ("icon_16x16@2x.png", 32),
    ("icon_32x32.png", 32),
    ("icon_32x32@2x.png", 64),
    ("icon_128x128.png", 128),
    ("icon_128x128@2x.png", 256),
    ("icon_256x256.png", 256),
    ("icon_256x256@2x.png", 512),
    ("icon_512x512.png", 512),
    ("icon_512x512@2x.png", 1024)
]

func drawIcon(size: CGFloat) -> NSImage {
    let image = NSImage(size: NSSize(width: size, height: size))
    image.lockFocus()
    defer { image.unlockFocus() }

    let rect = CGRect(x: 0, y: 0, width: size, height: size)
    NSColor.clear.setFill()
    rect.fill()

    let scale = size / 1024
    let card = rect.insetBy(dx: 72 * scale, dy: 72 * scale)
    let radius = 220 * scale

    let shadow = NSShadow()
    shadow.shadowColor = NSColor(calibratedRed: 0.05, green: 0.35, blue: 0.36, alpha: 0.22)
    shadow.shadowBlurRadius = 46 * scale
    shadow.shadowOffset = NSSize(width: 0, height: -20 * scale)
    let base = NSBezierPath(roundedRect: card, xRadius: radius, yRadius: radius)
    NSGraphicsContext.saveGraphicsState()
    shadow.set()
    NSGradient(colors: [
        NSColor(calibratedRed: 0.93, green: 0.99, blue: 0.97, alpha: 1),
        NSColor(calibratedRed: 0.79, green: 0.94, blue: 0.91, alpha: 1)
    ])?.draw(in: base, angle: 135)
    NSGraphicsContext.restoreGraphicsState()

    let glow = NSBezierPath(ovalIn: card.insetBy(dx: 130 * scale, dy: 130 * scale))
    NSColor(calibratedRed: 0.39, green: 0.86, blue: 0.79, alpha: 0.16).setFill()
    glow.fill()

    let ringRect = CGRect(
        x: 260 * scale,
        y: 260 * scale,
        width: 504 * scale,
        height: 504 * scale
    )

    let ring = NSBezierPath(ovalIn: ringRect)
    ring.lineWidth = 58 * scale
    NSColor(calibratedRed: 0.03, green: 0.55, blue: 0.49, alpha: 1).setStroke()
    ring.stroke()

    let gap = NSBezierPath()
    gap.lineWidth = 70 * scale
    gap.lineCapStyle = .round
    gap.appendArc(
        withCenter: CGPoint(x: 512 * scale, y: 512 * scale),
        radius: 252 * scale,
        startAngle: 36,
        endAngle: 72,
        clockwise: false
    )
    NSColor(calibratedRed: 0.90, green: 0.98, blue: 0.96, alpha: 1).setStroke()
    gap.stroke()

    let dot = NSBezierPath(ovalIn: CGRect(x: 706 * scale, y: 704 * scale, width: 92 * scale, height: 92 * scale))
    NSColor(calibratedRed: 0.16, green: 0.46, blue: 0.92, alpha: 1).setFill()
    dot.fill()

    let center = NSBezierPath(roundedRect: CGRect(x: 424 * scale, y: 424 * scale, width: 176 * scale, height: 176 * scale), xRadius: 48 * scale, yRadius: 48 * scale)
    NSColor(calibratedRed: 0.98, green: 1.00, blue: 0.99, alpha: 0.96).setFill()
    center.fill()

    let pauseLeft = NSBezierPath(roundedRect: CGRect(x: 468 * scale, y: 460 * scale, width: 28 * scale, height: 104 * scale), xRadius: 14 * scale, yRadius: 14 * scale)
    let pauseRight = NSBezierPath(roundedRect: CGRect(x: 528 * scale, y: 460 * scale, width: 28 * scale, height: 104 * scale), xRadius: 14 * scale, yRadius: 14 * scale)
    NSColor(calibratedRed: 0.04, green: 0.48, blue: 0.43, alpha: 1).setFill()
    pauseLeft.fill()
    pauseRight.fill()

    let highlight = NSBezierPath(roundedRect: card.insetBy(dx: 26 * scale, dy: 26 * scale), xRadius: radius - 20 * scale, yRadius: radius - 20 * scale)
    highlight.lineWidth = 10 * scale
    NSColor.white.withAlphaComponent(0.52).setStroke()
    highlight.stroke()

    return image
}

for (name, size) in sizes {
    let image = drawIcon(size: size)
    guard let tiff = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiff),
          let png = bitmap.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "IconGeneration", code: 1)
    }
    try png.write(to: iconset.appendingPathComponent(name))
}

try? FileManager.default.removeItem(at: output)

let icnsEntries: [(String, String)] = [
    ("icp4", "icon_16x16.png"),
    ("icp5", "icon_32x32.png"),
    ("icp6", "icon_32x32@2x.png"),
    ("ic07", "icon_128x128.png"),
    ("ic08", "icon_256x256.png"),
    ("ic09", "icon_512x512.png"),
    ("ic10", "icon_512x512@2x.png")
]

func appendFourCC(_ value: String, to data: inout Data) {
    data.append(value.data(using: .macOSRoman)!)
}

func appendUInt32(_ value: UInt32, to data: inout Data) {
    var bigEndian = value.bigEndian
    withUnsafeBytes(of: &bigEndian) { data.append(contentsOf: $0) }
}

var chunks = Data()
for (type, name) in icnsEntries {
    let png = try Data(contentsOf: iconset.appendingPathComponent(name))
    appendFourCC(type, to: &chunks)
    appendUInt32(UInt32(png.count + 8), to: &chunks)
    chunks.append(png)
}

var icns = Data()
appendFourCC("icns", to: &icns)
appendUInt32(UInt32(chunks.count + 8), to: &icns)
icns.append(chunks)
try icns.write(to: output)
