import Foundation
import SwiftUI

enum AppPage: String, Identifiable {
    case focus
    case tasks
    case calendar
    case stats

    var id: String { rawValue }

    static let allCases: [AppPage] = [.focus, .tasks, .calendar]

    var title: String {
        switch self {
        case .focus: "专注"
        case .tasks: "任务"
        case .calendar: "日历"
        case .stats: "统计"
        }
    }

    var symbol: String {
        switch self {
        case .focus: "timer"
        case .tasks: "checklist"
        case .calendar: "calendar"
        case .stats: "chart.bar"
        }
    }
}

enum ThemeID: String, CaseIterable, Codable, Identifiable {
    case blue
    case green
    case orange
    case purple
    case slate

    var id: String { rawValue }

    var name: String {
        switch self {
        case .blue: "冷静蓝"
        case .green: "自然绿"
        case .orange: "活力橙"
        case .purple: "创意紫"
        case .slate: "曜石黑"
        }
    }

    var primary: Color {
        switch self {
        case .blue: Color(red: 0.10, green: 0.45, blue: 0.91)
        case .green: Color(red: 0.00, green: 0.53, blue: 0.47)
        case .orange: Color(red: 0.78, green: 0.42, blue: 0.22)
        case .purple: Color(red: 0.43, green: 0.31, blue: 0.66)
        case .slate: Color(red: 0.25, green: 0.27, blue: 0.30)
        }
    }

    var secondary: Color {
        switch self {
        case .blue: Color(red: 0.41, green: 0.62, blue: 0.91)
        case .green: Color(red: 0.47, green: 0.90, blue: 0.84)
        case .orange: Color(red: 1.00, green: 0.64, blue: 0.39)
        case .purple: Color(red: 0.74, green: 0.59, blue: 0.96)
        case .slate: Color(red: 0.56, green: 0.62, blue: 0.71)
        }
    }

    var pageBackground: Color {
        switch self {
        case .blue: Color(red: 0.92, green: 0.95, blue: 1.00)
        case .green: Color(red: 0.92, green: 0.98, blue: 0.96)
        case .orange: Color(red: 1.00, green: 0.95, blue: 0.91)
        case .purple: Color(red: 0.97, green: 0.94, blue: 1.00)
        case .slate: Color(red: 0.95, green: 0.96, blue: 0.98)
        }
    }

    var sidebarBackground: Color {
        switch self {
        case .blue: Color(red: 0.96, green: 0.98, blue: 1.00)
        case .green: Color(red: 0.95, green: 0.99, blue: 0.98)
        case .orange: Color(red: 1.00, green: 0.98, blue: 0.95)
        case .purple: Color(red: 0.99, green: 0.96, blue: 1.00)
        case .slate: Color(red: 0.98, green: 0.98, blue: 0.99)
        }
    }

    var panelBackground: Color {
        switch self {
        case .blue: Color(red: 0.96, green: 0.98, blue: 1.00)
        case .green: Color(red: 0.95, green: 0.99, blue: 0.98)
        case .orange: Color(red: 1.00, green: 0.98, blue: 0.95)
        case .purple: Color(red: 0.99, green: 0.97, blue: 1.00)
        case .slate: Color(red: 0.98, green: 0.98, blue: 0.99)
        }
    }

    var cardBackground: Color {
        switch self {
        case .blue: Color(red: 0.89, green: 0.94, blue: 1.00)
        case .green: Color(red: 0.86, green: 0.96, blue: 0.94)
        case .orange: Color(red: 1.00, green: 0.92, blue: 0.84)
        case .purple: Color(red: 0.93, green: 0.87, blue: 1.00)
        case .slate: Color(red: 0.90, green: 0.92, blue: 0.95)
        }
    }

    var border: Color {
        switch self {
        case .blue: Color(red: 0.76, green: 0.85, blue: 1.00)
        case .green: Color(red: 0.72, green: 0.90, blue: 0.87)
        case .orange: Color(red: 0.96, green: 0.78, blue: 0.63)
        case .purple: Color(red: 0.84, green: 0.75, blue: 1.00)
        case .slate: Color(red: 0.82, green: 0.85, blue: 0.89)
        }
    }

    var soft: Color { cardBackground }
    var softer: Color { pageBackground }
}

enum FocusModeID: String, CaseIterable, Codable, Identifiable {
    case study
    case work
    case reading
    case creation
    case light
    case custom

    var id: String { rawValue }
}

enum TimerPhase: String, Codable {
    case focus
    case breakTime
}

struct FocusMode: Identifiable, Codable, Equatable {
    let id: FocusModeID
    let name: String
    let focusMinutes: Int
    let breakMinutes: Int
    let theme: ThemeID
    let symbol: String
}

struct TaskItem: Identifiable, Codable, Equatable {
    var id: UUID = UUID()
    var name: String
    var modeID: FocusModeID
    var completed: Bool = false
    var createdAt: Date = Date()
    var completedAt: Date?
    var totalFocusSeconds: TimeInterval = 0
}

struct FocusSession: Identifiable, Codable, Equatable {
    var id: UUID = UUID()
    var taskID: UUID?
    var modeID: FocusModeID
    var durationSeconds: TimeInterval
    var targetSeconds: TimeInterval
    var isCompletedTomato: Bool
    var isBreak: Bool
    var endedAt: Date = Date()
}

struct FocusStats {
    var todayMinutes: Int = 0
    var weekMinutes: Int = 0
    var monthMinutes: Int = 0
    var todayTomatoes: Int = 0
    var weekTomatoes: Int = 0
    var monthTomatoes: Int = 0
    var streakDays: Int = 0
    var completedTasks: Int = 0
}
