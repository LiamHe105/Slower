import Foundation

extension Calendar {
    static let app = Calendar(identifier: .gregorian)
}

extension Date {
    var dayKey: String {
        let formatter = DateFormatter()
        formatter.calendar = .app
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: self)
    }
}

func minutesText(_ seconds: TimeInterval) -> String {
    "\(Int((seconds / 60).rounded())) 分钟"
}

func minutesText(_ seconds: TimeInterval, language: AppLanguage) -> String {
    language.minutes(seconds)
}
