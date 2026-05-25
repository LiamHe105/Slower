// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "FocusAssistantNative",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "FocusAssistant", targets: ["FocusAssistant"])
    ],
    targets: [
        .executableTarget(
            name: "FocusAssistant",
            path: "Sources/FocusAssistant"
        )
    ]
)

