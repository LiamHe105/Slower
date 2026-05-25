import Foundation

struct AppData: Codable {
    var tasks: [TaskItem]
    var sessions: [FocusSession]
    var themeID: ThemeID
    var customFocusMinutes: Int
    var customBreakMinutes: Int
    var dailyNotes: [String: String]?
    var todayGoalDate: String?
    var todayGoalText: String?
    var todayGoalMinutes: Int?
    var customModeName: String?
    var customModeSymbol: String?

    static let empty = AppData(
        tasks: [
            TaskItem(name: "阅读技术文档或一章新书", modeID: .reading),
            TaskItem(name: "整理今天的工作备忘清单", modeID: .light)
        ],
        sessions: [],
        themeID: .blue,
        customFocusMinutes: 25,
        customBreakMinutes: 5,
        dailyNotes: [:],
        todayGoalDate: nil,
        todayGoalText: nil,
        todayGoalMinutes: nil,
        customModeName: nil,
        customModeSymbol: nil
    )
}
