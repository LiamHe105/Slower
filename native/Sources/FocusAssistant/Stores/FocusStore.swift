import Foundation
import SwiftUI

final class FocusStore: ObservableObject {
    @Published var tasks: [TaskItem] = []
    @Published var sessions: [FocusSession] = []
    @Published var themeID: ThemeID = .blue
    @Published var activeModeID: FocusModeID = .study
    @Published var selectedTaskID: UUID?
    @Published var customFocusMinutes = 25
    @Published var customBreakMinutes = 5
    @Published var dailyNotes: [String: String] = [:]
    @Published var todayGoalDate: String?
    @Published var todayGoalText = ""
    @Published var todayGoalMinutes: Int?
    @Published var customModeName = "自定义"
    @Published var customModeSymbol = "slider.horizontal.3"
    @Published var language: AppLanguage = .chinese
    @Published var settlement: FocusSession?
    @Published var timerPhase: TimerPhase = .focus
    @Published var timerIsRunning = false
    @Published var timerStartedAt: Date?
    @Published var timerEndsAt: Date?
    @Published var pausedRemainingSeconds: TimeInterval?

    var modes: [FocusMode] {
        [
        FocusMode(id: .study, name: language.text("学习", "Study"), focusMinutes: 25, breakMinutes: 5, theme: .blue, symbol: "graduationcap"),
        FocusMode(id: .work, name: language.text("工作", "Work"), focusMinutes: 45, breakMinutes: 10, theme: .slate, symbol: "briefcase"),
        FocusMode(id: .reading, name: language.text("阅读", "Reading"), focusMinutes: 30, breakMinutes: 5, theme: .purple, symbol: "book"),
        FocusMode(id: .creation, name: language.text("创作", "Creation"), focusMinutes: 60, breakMinutes: 10, theme: .orange, symbol: "paintpalette"),
        FocusMode(id: .light, name: language.text("轻专注", "Light Focus"), focusMinutes: 15, breakMinutes: 3, theme: .green, symbol: "cup.and.saucer"),
        FocusMode(id: .custom, name: localizedCustomModeName, focusMinutes: 25, breakMinutes: 5, theme: .blue, symbol: customModeSymbol)
        ]
    }

    let commonModeSymbols = [
        "slider.horizontal.3", "sparkles", "pencil.and.outline", "paintbrush",
        "book", "laptopcomputer", "music.note", "brain.head.profile",
        "leaf", "flame", "star", "target"
    ]

    var theme: ThemeID { themeID }

    var localizedCustomModeName: String {
        if customModeName == "自定义" || customModeName == "Custom" {
            return language.text("自定义", "Custom")
        }
        return customModeName
    }

    init() {
        load()
    }

    var activeMode: FocusMode {
        modes.first(where: { $0.id == activeModeID }) ?? modes[0]
    }

    var currentFocusMinutes: Int {
        customFocusMinutes
    }

    var currentBreakMinutes: Int {
        customBreakMinutes
    }

    func selectMode(_ modeID: FocusModeID) {
        activeModeID = modeID
        save()
    }

    func updateCustomMode(name: String, symbol: String) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        customModeName = trimmed.isEmpty ? language.text("自定义", "Custom") : trimmed
        customModeSymbol = symbol
        activeModeID = .custom
        save()
    }

    func addTask(named name: String, modeID: FocusModeID) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        tasks.insert(TaskItem(name: trimmed, modeID: modeID), at: 0)
        save()
    }

    func toggleTask(_ task: TaskItem) {
        guard let index = tasks.firstIndex(where: { $0.id == task.id }) else { return }
        tasks[index].completed.toggle()
        tasks[index].completedAt = tasks[index].completed ? Date() : nil
        save()
    }

    func deleteTask(_ task: TaskItem) {
        tasks.removeAll { $0.id == task.id }
        if selectedTaskID == task.id {
            selectedTaskID = nil
        }
        save()
    }

    func deleteSession(_ session: FocusSession) {
        sessions.removeAll { $0.id == session.id }
        if let taskID = session.taskID, !session.isBreak,
           let index = tasks.firstIndex(where: { $0.id == taskID }) {
            tasks[index].totalFocusSeconds = max(0, tasks[index].totalFocusSeconds - session.durationSeconds)
        }
        save()
    }

    func updateTask(_ task: TaskItem, name: String) {
        guard let index = tasks.firstIndex(where: { $0.id == task.id }) else { return }
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        tasks[index].name = trimmed
        save()
    }

    func recordFocus(duration: TimeInterval, target: TimeInterval, isBreak: Bool = false) {
        guard duration > 0 || isBreak else { return }
        let isTomato = !isBreak && duration >= 15 * 60
        let session = FocusSession(
            taskID: isBreak ? nil : selectedTaskID,
            modeID: activeModeID,
            durationSeconds: duration,
            targetSeconds: target,
            isCompletedTomato: isTomato,
            isBreak: isBreak
        )
        sessions.insert(session, at: 0)

        if let taskID = selectedTaskID, !isBreak,
           let index = tasks.firstIndex(where: { $0.id == taskID }) {
            tasks[index].totalFocusSeconds += duration
        }

        if !isBreak && isTomato {
            settlement = session
        }

        save()
    }

    func timerTargetSeconds() -> TimeInterval {
        TimeInterval((timerPhase == .focus ? currentFocusMinutes : currentBreakMinutes) * 60)
    }

    func timerRemainingSeconds(now: Date = Date()) -> TimeInterval {
        if timerIsRunning, let timerEndsAt {
            return max(0, timerEndsAt.timeIntervalSince(now))
        }
        return pausedRemainingSeconds ?? timerTargetSeconds()
    }

    func toggleTimer(now: Date = Date()) {
        if timerIsRunning {
            pausedRemainingSeconds = timerRemainingSeconds(now: now)
            timerIsRunning = false
        } else {
            let remaining = pausedRemainingSeconds ?? timerTargetSeconds()
            if timerStartedAt == nil {
                timerStartedAt = now
            }
            timerEndsAt = now.addingTimeInterval(remaining)
            pausedRemainingSeconds = remaining
            timerIsRunning = true
        }
    }

    func resetTimer() {
        timerIsRunning = false
        timerStartedAt = nil
        timerEndsAt = nil
        pausedRemainingSeconds = nil
        timerPhase = .focus
    }

    func finishTimerIfNeeded(now: Date = Date()) -> Bool {
        guard timerIsRunning, let endsAt = timerEndsAt, now >= endsAt else { return false }
        let target = timerTargetSeconds()
        if timerPhase == .focus {
            recordFocus(duration: target, target: target)
            timerPhase = .breakTime
        } else {
            recordFocus(duration: target, target: target, isBreak: true)
            timerPhase = .focus
        }
        timerIsRunning = false
        timerStartedAt = nil
        timerEndsAt = nil
        pausedRemainingSeconds = nil
        return true
    }

    func finishTimerEarly(now: Date = Date()) {
        guard let timerStartedAt else { return }
        let elapsed = now.timeIntervalSince(timerStartedAt)
        if timerPhase == .focus {
            recordFocus(duration: elapsed, target: timerTargetSeconds())
        }
        resetTimer()
    }

    func setTimerDurations(focus: Int, breakMinutes: Int) {
        resetTimer()
        customFocusMinutes = focus
        customBreakMinutes = breakMinutes
        save()
    }

    func isFirstCheckIn(_ session: FocusSession) -> Bool {
        guard session.isCompletedTomato else { return false }
        return sessions.filter {
            !$0.isBreak && $0.isCompletedTomato && $0.endedAt.dayKey == session.endedAt.dayKey
        }.count == 1
    }

    func addTomorrowTaskIfNeeded(_ name: String, modeID: FocusModeID) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        let tomorrow = Calendar.app.date(byAdding: .day, value: 1, to: Date()) ?? Date()
        var task = TaskItem(name: trimmed, modeID: modeID)
        task.createdAt = tomorrow
        tasks.insert(task, at: 0)
        save()
    }

    func stats() -> FocusStats {
        let now = Date()
        let calendar = Calendar.app
        let todayStart = calendar.startOfDay(for: now)
        let weekInterval = calendar.dateInterval(of: .weekOfYear, for: now)
        let monthInterval = calendar.dateInterval(of: .month, for: now)

        var result = FocusStats()
        result.completedTasks = tasks.filter(\.completed).count

        for session in sessions where !session.isBreak {
            if session.endedAt >= todayStart {
                result.todayMinutes += Int((session.durationSeconds / 60).rounded())
                if session.isCompletedTomato { result.todayTomatoes += 1 }
            }
            if let weekStart = weekInterval?.start, session.endedAt >= weekStart {
                result.weekMinutes += Int((session.durationSeconds / 60).rounded())
                if session.isCompletedTomato { result.weekTomatoes += 1 }
            }
            if let monthStart = monthInterval?.start, session.endedAt >= monthStart {
                result.monthMinutes += Int((session.durationSeconds / 60).rounded())
                if session.isCompletedTomato { result.monthTomatoes += 1 }
            }
        }

        let checkInKeys = Set(sessions.filter { !$0.isBreak && $0.isCompletedTomato }.map { $0.endedAt.dayKey })
        var cursor = todayStart
        while checkInKeys.contains(cursor.dayKey) {
            result.streakDays += 1
            cursor = calendar.date(byAdding: .day, value: -1, to: cursor) ?? cursor
        }

        return result
    }

    func dailySummary(for monthDate: Date) -> [String: (count: Int, seconds: TimeInterval)] {
        var map: [String: (count: Int, seconds: TimeInterval)] = [:]
        for session in sessions where !session.isBreak {
            let key = session.endedAt.dayKey
            map[key, default: (0, 0)].seconds += session.durationSeconds
            if session.isCompletedTomato {
                map[key, default: (0, 0)].count += 1
            }
        }
        return map
    }

    func sessions(on date: Date) -> [FocusSession] {
        let key = date.dayKey
        return sessions
            .filter { !$0.isBreak && $0.endedAt.dayKey == key }
            .sorted { $0.endedAt > $1.endedAt }
    }

    func taskName(for id: UUID?) -> String {
        guard let id else { return language.text("未绑定任务", "No linked task") }
        return tasks.first(where: { $0.id == id })?.name ?? language.text("已删除任务", "Deleted task")
    }

    func modeName(for id: FocusModeID) -> String {
        modes.first(where: { $0.id == id })?.name ?? language.text("未知模式", "Unknown mode")
    }

    func modeSymbol(for id: FocusModeID) -> String {
        modes.first(where: { $0.id == id })?.symbol ?? "questionmark.circle"
    }

    func note(for date: Date) -> String {
        dailyNotes[date.dayKey] ?? ""
    }

    func updateNote(_ note: String, for date: Date) {
        let key = date.dayKey
        if note.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            dailyNotes.removeValue(forKey: key)
        } else {
            dailyNotes[key] = note
        }
        save()
    }

    var activeTodayGoalMinutes: Int? {
        todayGoalDate == Date().dayKey ? todayGoalMinutes : nil
    }

    var activeTodayGoalText: String {
        todayGoalDate == Date().dayKey ? todayGoalText : ""
    }

    func updateTodayGoal(text: String, minutes: Int?) {
        todayGoalDate = Date().dayKey
        todayGoalText = text.trimmingCharacters(in: .whitespacesAndNewlines)
        todayGoalMinutes = minutes
        save()
    }

    private var fileURL: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        let directory = base.appendingPathComponent("FocusAssistant", isDirectory: true)
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        return directory.appendingPathComponent("data.json")
    }

    private func load() {
        guard let data = try? Data(contentsOf: fileURL),
              let decoded = try? JSONDecoder.app.decode(AppData.self, from: data) else {
            let initial = AppData.empty
            tasks = initial.tasks
            sessions = initial.sessions
            themeID = initial.themeID
            customFocusMinutes = initial.customFocusMinutes
            customBreakMinutes = initial.customBreakMinutes
            dailyNotes = initial.dailyNotes ?? [:]
            todayGoalDate = initial.todayGoalDate
            todayGoalText = initial.todayGoalText ?? ""
            todayGoalMinutes = initial.todayGoalMinutes
            customModeName = initial.customModeName ?? "自定义"
            customModeSymbol = initial.customModeSymbol ?? "slider.horizontal.3"
            language = initial.language ?? .chinese
            return
        }
        tasks = decoded.tasks
        sessions = decoded.sessions
        themeID = decoded.themeID
        customFocusMinutes = decoded.customFocusMinutes
        customBreakMinutes = decoded.customBreakMinutes
        dailyNotes = decoded.dailyNotes ?? [:]
        todayGoalDate = decoded.todayGoalDate
        todayGoalText = decoded.todayGoalText ?? ""
        todayGoalMinutes = decoded.todayGoalMinutes
        customModeName = decoded.customModeName ?? "自定义"
        customModeSymbol = decoded.customModeSymbol ?? "slider.horizontal.3"
        language = decoded.language ?? .chinese
    }

    func save() {
        let data = AppData(
            tasks: tasks,
            sessions: sessions,
            themeID: themeID,
            customFocusMinutes: customFocusMinutes,
            customBreakMinutes: customBreakMinutes,
            dailyNotes: dailyNotes,
            todayGoalDate: todayGoalDate,
            todayGoalText: todayGoalText,
            todayGoalMinutes: todayGoalMinutes,
            customModeName: customModeName,
            customModeSymbol: customModeSymbol,
            language: language
        )
        if let encoded = try? JSONEncoder.app.encode(data) {
            try? encoded.write(to: fileURL, options: .atomic)
        }
    }
}

private extension JSONEncoder {
    static var app: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }
}

private extension JSONDecoder {
    static var app: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}
