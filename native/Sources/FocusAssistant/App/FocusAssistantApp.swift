import SwiftUI
import AppKit

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }
}

@main
struct FocusAssistantApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var store = FocusStore()

    var body: some Scene {
        WindowGroup("Slower") {
            ContentView()
                .environmentObject(store)
                .frame(minWidth: 980, minHeight: 680)
        }
        .windowStyle(.titleBar)
        .commands {
            CommandGroup(replacing: .newItem) { }
            CommandMenu("主题") {
                ForEach(ThemeID.allCases) { theme in
                    Button(theme.name) {
                        store.themeID = theme
                        store.save()
                    }
                    .keyboardShortcut(theme.shortcut, modifiers: [.command, .option])
                }
            }
        }

        Settings {
            SettingsView()
                .environmentObject(store)
                .frame(width: 420)
        }
    }
}

private extension ThemeID {
    var shortcut: KeyEquivalent {
        switch self {
        case .blue: "1"
        case .green: "2"
        case .orange: "3"
        case .purple: "4"
        case .slate: "5"
        }
    }
}
