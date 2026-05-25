import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var store: FocusStore

    var body: some View {
        Form {
            Picker(store.language.text("默认主题", "Default Theme"), selection: $store.themeID) {
                ForEach(ThemeID.allCases) { theme in
                    Text(theme.name(language: store.language)).tag(theme)
                }
            }

            Stepper(store.language.text("自定义专注 \(store.customFocusMinutes) 分钟", "Custom focus \(store.customFocusMinutes) min"), value: $store.customFocusMinutes, in: 1...120)
            Stepper(store.language.text("自定义休息 \(store.customBreakMinutes) 分钟", "Custom break \(store.customBreakMinutes) min"), value: $store.customBreakMinutes, in: 1...30)
        }
        .padding()
        .onChange(of: store.themeID) { _, _ in store.save() }
        .onChange(of: store.customFocusMinutes) { _, _ in store.save() }
        .onChange(of: store.customBreakMinutes) { _, _ in store.save() }
    }
}
