import Foundation

enum AppLanguage: String, CaseIterable, Codable, Identifiable {
    case chinese
    case english

    var id: String { rawValue }

    var name: String {
        switch self {
        case .chinese: "中文"
        case .english: "English"
        }
    }

    var locale: Locale {
        switch self {
        case .chinese: Locale(identifier: "zh_CN")
        case .english: Locale(identifier: "en_US")
        }
    }

    func text(_ chinese: String, _ english: String) -> String {
        self == .chinese ? chinese : english
    }

    func minutes(_ seconds: TimeInterval) -> String {
        let value = Int((seconds / 60).rounded())
        return text("\(value) 分钟", "\(value) min")
    }

    func date(_ date: Date, format: DateTextFormat) -> String {
        let formatter = DateFormatter()
        formatter.locale = locale
        switch format {
        case .header:
            formatter.dateFormat = self == .chinese ? "yyyy年M月d日 EEEE" : "EEEE, MMM d, yyyy"
        case .month:
            formatter.dateFormat = self == .chinese ? "yyyy年 M月" : "MMMM yyyy"
        case .time:
            formatter.dateFormat = "HH:mm"
        }
        return formatter.string(from: date)
    }
}

enum DateTextFormat {
    case header
    case month
    case time
}
