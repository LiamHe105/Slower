import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var store: FocusStore

    var body: some View {
        Form {
            Picker("默认主题", selection: $store.themeID) {
                ForEach(ThemeID.allCases) { theme in
                    Text(theme.name).tag(theme)
                }
            }

            Stepper("自定义专注 \(store.customFocusMinutes) 分钟", value: $store.customFocusMinutes, in: 1...120)
            Stepper("自定义休息 \(store.customBreakMinutes) 分钟", value: $store.customBreakMinutes, in: 1...30)
        }
        .padding()
        .onChange(of: store.themeID) { _, _ in store.save() }
        .onChange(of: store.customFocusMinutes) { _, _ in store.save() }
        .onChange(of: store.customBreakMinutes) { _, _ in store.save() }
    }
}

