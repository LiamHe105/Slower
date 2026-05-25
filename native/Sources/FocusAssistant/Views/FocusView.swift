import SwiftUI
import AppKit

struct FocusView: View {
    @EnvironmentObject private var store: FocusStore
    @State private var now = Date()
    @State private var showingCustom = false

    private let ticker = Timer.publish(every: 0.25, on: .main, in: .common).autoconnect()

    var body: some View {
        GeometryReader { proxy in
            HStack(alignment: .top, spacing: 20) {
                SectionCard {
                    VStack(spacing: 22) {
                        taskBinding
                        timerDial
                        controls
                        presetStrip
                    }
                    .frame(maxWidth: .infinity)
                }
                .frame(maxWidth: .infinity)

                ScrollView(.vertical) {
                    VStack(spacing: 20) {
                        TaskMiniPanel()
                        ModePanel()
                    }
                    .padding(.trailing, 4)
                }
                .scrollIndicators(.automatic)
                .frame(width: 330, height: proxy.size.height)
            }
            .frame(width: proxy.size.width, height: proxy.size.height, alignment: .top)
        }
        .onReceive(ticker) { date in
            now = date
            if store.finishTimerIfNeeded(now: date) {
                NSSound.beep()
            }
        }
        .sheet(isPresented: $showingCustom) {
            CustomDurationView()
        }
    }

    private var taskBinding: some View {
        Group {
            if let task = store.tasks.first(where: { $0.id == store.selectedTaskID }) {
                HStack {
                    Image(systemName: "target")
                    Text(task.name)
                        .lineLimit(1)
                    Button("取消") { store.selectedTaskID = nil }
                        .buttonStyle(.borderless)
                }
                .font(.callout)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(store.theme.soft, in: Capsule())
            } else {
                Text("未绑定任务，专注记录仍会保存")
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var timerDial: some View {
        let target = store.timerTargetSeconds()
        let remain = store.timerRemainingSeconds(now: now)
        let progress = target <= 0 ? 0 : max(0, min(1, remain / target))

        return ZStack {
            Circle()
                .stroke(store.theme.soft, lineWidth: 12)
            Circle()
                .trim(from: 0, to: progress)
                .stroke(store.theme.primary, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeOut(duration: 0.2), value: progress)
            VStack(spacing: 8) {
                Text(store.timerPhase == .focus ? store.activeMode.name : "休息")
                    .font(.headline)
                    .foregroundStyle(store.theme.primary)
                Text(clockText(remain))
                    .font(.system(size: 54, weight: .bold, design: .rounded))
                    .monospacedDigit()
                Text(store.timerIsRunning ? "进行中" : "暂停")
                    .foregroundStyle(.secondary)
            }
        }
        .frame(width: 310, height: 310)
    }

    private var controls: some View {
        HStack(spacing: 14) {
            Button {
                store.resetTimer()
            } label: {
                Label("重置", systemImage: "arrow.counterclockwise")
            }
            .keyboardShortcut("r")

            Button {
                store.toggleTimer(now: now)
            } label: {
                Label(store.timerIsRunning ? "暂停" : "开始", systemImage: store.timerIsRunning ? "pause.fill" : "play.fill")
                    .frame(width: 120)
            }
            .buttonStyle(.borderedProminent)
            .tint(store.theme.primary)
            .keyboardShortcut(.space, modifiers: [])

            Button {
                store.finishTimerEarly(now: now)
            } label: {
                Label("结束并记录", systemImage: "stop.fill")
            }
            .disabled(!store.timerIsRunning && store.timerStartedAt == nil)
        }
    }

    private var presetStrip: some View {
        HStack {
            Button("15/3") { store.setTimerDurations(focus: 15, breakMinutes: 3) }
            Button("25/5") { store.setTimerDurations(focus: 25, breakMinutes: 5) }
            Button("45/10") { store.setTimerDurations(focus: 45, breakMinutes: 10) }
            Button("60/10") { store.setTimerDurations(focus: 60, breakMinutes: 10) }
            Button("自定义") { showingCustom = true }
        }
        .buttonStyle(.bordered)
        .disabled(store.timerIsRunning)
    }

    private func clockText(_ seconds: TimeInterval) -> String {
        let total = max(0, Int(seconds.rounded(.up)))
        return String(format: "%02d:%02d", total / 60, total % 60)
    }
}

struct ModePanel: View {
    @EnvironmentObject private var store: FocusStore
    @State private var showingCustomMode = false

    var body: some View {
        SectionCard {
            VStack(alignment: .leading, spacing: 14) {
                Label("专注模式", systemImage: "slider.horizontal.3")
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundStyle(store.theme.primary)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                    ForEach(store.modes) { mode in
                        Button {
                            if mode.id == .custom {
                                store.selectMode(.custom)
                                showingCustomMode = true
                            } else {
                                store.selectMode(mode.id)
                            }
                        } label: {
                            HStack(spacing: 7) {
                                Image(systemName: mode.symbol)
                                    .font(.system(size: 12, weight: .semibold))
                                Text(mode.name)
                                    .lineLimit(1)
                                    .minimumScaleFactor(0.85)
                                Spacer(minLength: 0)
                            }
                            .font(.system(size: 13, weight: .bold))
                            .foregroundStyle(store.activeModeID == mode.id ? .white : store.theme.primary)
                            .padding(.horizontal, 10)
                            .frame(height: 32)
                            .background(store.activeModeID == mode.id ? store.theme.primary : store.theme.cardBackground, in: Capsule())
                            .overlay {
                                Capsule().stroke(store.theme.border)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
        .sheet(isPresented: $showingCustomMode) {
            CustomDurationView()
        }
    }
}

struct TaskMiniPanel: View {
    @EnvironmentObject private var store: FocusStore

    var body: some View {
        SectionCard {
            VStack(alignment: .leading, spacing: 12) {
                Text("选择任务")
                    .font(.headline)
                let orderedTasks = store.tasks.sorted { first, second in
                    if first.completed != second.completed {
                        return !first.completed
                    }
                    return first.createdAt > second.createdAt
                }
                if orderedTasks.isEmpty {
                    Text("请在“待办清单”设置今日任务")
                        .foregroundStyle(.secondary)
                        .font(.system(size: 13, weight: .semibold))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(store.theme.cardBackground.opacity(0.7), in: RoundedRectangle(cornerRadius: 12))
                } else {
                    ForEach(orderedTasks.prefix(8)) { task in
                        HStack(spacing: 10) {
                            Button {
                                store.toggleTask(task)
                            } label: {
                                Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                                    .font(.system(size: 17, weight: .semibold))
                                    .foregroundStyle(task.completed ? store.theme.primary : .secondary)
                            }
                            .buttonStyle(.plain)

                            Button {
                                store.selectedTaskID = store.selectedTaskID == task.id ? nil : task.id
                            } label: {
                                HStack {
                                    Text(task.name)
                                        .lineLimit(1)
                                        .strikethrough(task.completed)
                                        .foregroundStyle(task.completed ? .secondary : .primary)
                                    Spacer()
                                    if store.selectedTaskID == task.id {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundStyle(store.theme.primary)
                                    }
                                }
                                .contentShape(Rectangle())
                            }
                            .buttonStyle(.plain)
                        }
                        .padding(.vertical, 7)
                        .padding(.horizontal, 8)
                        .background(store.selectedTaskID == task.id ? store.theme.cardBackground : .clear, in: RoundedRectangle(cornerRadius: 10))
                        Divider()
                    }
                }
            }
        }
    }
}

struct CustomDurationView: View {
    @EnvironmentObject private var store: FocusStore
    @Environment(\.dismiss) private var dismiss
    @State private var modeName = ""
    @State private var selectedSymbol = "slider.horizontal.3"

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("自定义模式")
                .font(.title3.weight(.semibold))
            TextField("模式名称", text: $modeName)
                .textFieldStyle(.roundedBorder)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 10) {
                ForEach(store.commonModeSymbols, id: \.self) { symbol in
                    Button {
                        selectedSymbol = symbol
                    } label: {
                        Image(systemName: symbol)
                            .font(.system(size: 18, weight: .semibold))
                            .frame(width: 42, height: 34)
                            .background(selectedSymbol == symbol ? store.theme.primary : store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 10))
                            .foregroundStyle(selectedSymbol == symbol ? .white : store.theme.primary)
                            .overlay { RoundedRectangle(cornerRadius: 10).stroke(store.theme.border) }
                    }
                    .buttonStyle(.plain)
                }
            }

            Stepper("专注 \(store.customFocusMinutes) 分钟", value: $store.customFocusMinutes, in: 1...120)
            Stepper("休息 \(store.customBreakMinutes) 分钟", value: $store.customBreakMinutes, in: 1...30)
            HStack {
                Spacer()
                Button("完成") {
                    store.updateCustomMode(name: modeName, symbol: selectedSymbol)
                    store.resetTimer()
                    store.save()
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .tint(store.theme.primary)
            }
        }
        .padding(24)
        .frame(width: 360)
        .onAppear {
            modeName = store.customModeName
            selectedSymbol = store.customModeSymbol
        }
    }
}
