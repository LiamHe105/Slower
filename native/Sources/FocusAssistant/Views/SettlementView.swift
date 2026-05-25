import SwiftUI

struct SettlementView: View {
    @EnvironmentObject private var store: FocusStore
    @Environment(\.dismiss) private var dismiss
    let session: FocusSession
    @State private var dailySummary = ""
    @State private var tomorrowPlan = ""

    private var quotes: [(String, String)] {
        if store.language == .chinese {
            return [
                ("亚里士多德", "优秀不是一种行为，而是一种习惯。"),
                ("村上春树", "今天不想跑，所以才去跑。"),
                ("歌德", "只要开始，完成就在路上。"),
                ("爱默生", "专注当下，力量自然聚集。"),
                ("海明威", "每天向前写一点，胜过等待完美的一天。")
            ]
        }
        return [
            ("Aristotle", "Excellence is not an act, but a habit."),
            ("Haruki Murakami", "I run because I do not want to run today."),
            ("Goethe", "Once you begin, completion is already on the road."),
            ("Emerson", "Focus on the present, and strength gathers."),
            ("Hemingway", "Write a little each day instead of waiting for perfection.")
        ]
    }

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
                        Text(session.isCompletedTomato ? store.language.text("专注书签", "Focus Bookmark") : store.language.text("专注记录", "Focus Record"))
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
                    SettlementMetric(title: store.language.text("本次", "This Session"), value: "\(Int((session.durationSeconds / 60).rounded()))", unit: store.language.text("分钟", "min"))
                    SettlementMetric(title: store.language.text("本周", "This Week"), value: "\(stats.weekTomatoes)", unit: store.language.text("次", "x"))
                    SettlementMetric(title: store.language.text("本月", "This Month"), value: "\(stats.monthTomatoes)", unit: store.language.text("次", "x"))
                }

                if firstCheckIn {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(store.language.text("今日小结 / 明日计划", "Daily Note / Tomorrow Plan"))
                            .font(.system(size: 14, weight: .bold))
                        TextEditor(text: $dailySummary)
                            .frame(height: 70)
                            .scrollContentBackground(.hidden)
                            .padding(8)
                            .background(.white.opacity(0.65), in: RoundedRectangle(cornerRadius: 12))
                            .overlay { RoundedRectangle(cornerRadius: 12).stroke(store.theme.border) }
                        TextField(store.language.text("明天第一件想推进的事", "First thing to move forward tomorrow"), text: $tomorrowPlan)
                            .textFieldStyle(.roundedBorder)
                    }
                }

                Button(store.language.text("收下书签", "Keep Bookmark")) {
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
        store.language.date(session.endedAt, format: .header)
    }

    private func feedback(stats: FocusStats) -> String {
        let mode = store.activeMode.name
        let hoursToday = stats.todayMinutes / 60
        let templates = [
            store.language.text("本周已经打卡 \(stats.weekTomatoes) 次，节奏正在变稳，加油鸭！", "You have checked in \(stats.weekTomatoes) times this week. Your rhythm is getting steadier."),
            store.language.text("本月累计 \(stats.monthTomatoes) 次打卡，你已经在给未来的自己存进度。", "\(stats.monthTomatoes) check-ins this month. You are investing in your future self."),
            store.language.text("今天已专注 \(stats.todayMinutes) 分钟，记得给自己一点奖励。", "You focused for \(stats.todayMinutes) minutes today. Give yourself a small reward."),
            hoursToday >= 8 ? store.language.text("今天已连续工作 \(hoursToday) 小时，记得买杯奶茶好好犒劳自己🥤～", "You have worked for \(hoursToday) hours today. Take a real break.") : store.language.text("今天的专注已经落地，下一步只要继续保持节奏。", "Today's focus is logged. Keep the rhythm going."),
            mode == store.language.text("创作", "Creation") ? store.language.text("今天的创作模式有推进，灵感也是靠一次次坐下来抓住的。", "Creation mode moved forward today. Inspiration is caught by showing up.") : store.language.text("\(mode)模式完成一次达标专注，状态不错。", "\(mode) completed a solid focus session.")
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
