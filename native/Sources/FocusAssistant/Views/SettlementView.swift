import SwiftUI

struct SettlementView: View {
    @EnvironmentObject private var store: FocusStore
    @Environment(\.dismiss) private var dismiss
    let session: FocusSession
    @State private var dailySummary = ""
    @State private var tomorrowPlan = ""

    private let quotes = [
        ("亚里士多德", "优秀不是一种行为，而是一种习惯。"),
        ("村上春树", "今天不想跑，所以才去跑。"),
        ("歌德", "只要开始，完成就在路上。"),
        ("爱默生", "专注当下，力量自然聚集。"),
        ("海明威", "每天向前写一点，胜过等待完美的一天。")
    ]

    var body: some View {
        let stats = store.stats()
        let firstCheckIn = store.isFirstCheckIn(session)
        let quote = quotes[abs(session.id.hashValue) % quotes.count]

        VStack(spacing: 0) {
            Rectangle()
                .fill(store.theme.primary)
                .frame(height: 10)

            VStack(spacing: 18) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(sessionDate)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundStyle(store.theme.primary)
                        Text(session.isCompletedTomato ? "专注书签" : "专注记录")
                            .font(.system(size: 25, weight: .bold, design: .rounded))
                    }
                    Spacer()
                    Image(systemName: "bookmark.fill")
                        .font(.system(size: 42))
                        .foregroundStyle(store.theme.primary)
                }

                Text(feedback(stats: stats))
                    .font(.system(size: 16, weight: .bold))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.primary)
                    .padding(16)
                    .frame(maxWidth: .infinity)
                    .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 18))

                VStack(spacing: 4) {
                    Text("“\(quote.1)”")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                    Text("- \(quote.0)")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(store.theme.primary)
                }

                HStack(spacing: 10) {
                    SettlementMetric(title: "本次", value: "\(Int((session.durationSeconds / 60).rounded()))", unit: "分钟")
                    SettlementMetric(title: "本周", value: "\(stats.weekTomatoes)", unit: "次")
                    SettlementMetric(title: "本月", value: "\(stats.monthTomatoes)", unit: "次")
                }

                if firstCheckIn {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("今日小结 / 明日计划")
                            .font(.system(size: 14, weight: .bold))
                        TextEditor(text: $dailySummary)
                            .frame(height: 70)
                            .scrollContentBackground(.hidden)
                            .padding(8)
                            .background(.white.opacity(0.65), in: RoundedRectangle(cornerRadius: 12))
                            .overlay { RoundedRectangle(cornerRadius: 12).stroke(store.theme.border) }
                        TextField("明天第一件想推进的事", text: $tomorrowPlan)
                            .textFieldStyle(.roundedBorder)
                    }
                }

                Button("收下书签") {
                    if firstCheckIn {
                        store.updateNote(dailySummary, for: Date())
                        store.addTomorrowTaskIfNeeded(tomorrowPlan, modeID: session.modeID)
                    }
                    store.settlement = nil
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .tint(store.theme.primary)
                .controlSize(.large)
            }
            .padding(26)
        }
        .frame(width: 430)
        .background(store.theme.panelBackground)
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .overlay {
            RoundedRectangle(cornerRadius: 24).stroke(store.theme.border)
        }
        .onAppear {
            dailySummary = store.note(for: Date())
        }
    }

    private var sessionDate: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "yyyy年M月d日 EEEE"
        return formatter.string(from: session.endedAt)
    }

    private func feedback(stats: FocusStats) -> String {
        let mode = store.activeMode.name
        let hoursToday = stats.todayMinutes / 60
        let templates = [
            "本周已经打卡 \(stats.weekTomatoes) 次，节奏正在变稳，加油鸭！",
            "本月累计 \(stats.monthTomatoes) 次打卡，你已经在给未来的自己存进度。",
            "今天已专注 \(stats.todayMinutes) 分钟，记得给自己一点奖励。",
            hoursToday >= 8 ? "今天已连续工作 \(hoursToday) 小时，记得买杯奶茶好好犒劳自己🥤～" : "今天的专注已经落地，下一步只要继续保持节奏。",
            mode == "创作" ? "今天的创作模式有推进，灵感也是靠一次次坐下来抓住的。" : "\(mode)模式完成一次达标专注，状态不错。"
        ]
        return templates[abs(session.id.hashValue) % templates.count]
    }
}

struct SettlementMetric: View {
    @EnvironmentObject private var store: FocusStore
    let title: String
    let value: String
    let unit: String

    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            HStack(alignment: .lastTextBaseline, spacing: 3) {
                Text(value)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(store.theme.primary)
                Text(unit)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(12)
        .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 12))
        .overlay { RoundedRectangle(cornerRadius: 12).stroke(store.theme.border) }
    }
}

