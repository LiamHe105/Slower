import SwiftUI

struct StatsView: View {
    @EnvironmentObject private var store: FocusStore

    var body: some View {
        let stats = store.stats()
        SectionCard(maxWidth: 520) {
            VStack(alignment: .leading, spacing: 20) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 5) {
                        Label("专注数据大观", systemImage: "chart.bar")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundStyle(store.theme.primary)
                        Text("全方位分析你近期自律奋斗的时光")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Label("\(stats.streakDays)天连击", systemImage: "trophy")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(store.theme.primary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
                        .overlay { RoundedRectangle(cornerRadius: 14).stroke(store.theme.border) }
                }

                Divider().background(store.theme.border)

                HStack {
                    VStack(alignment: .leading, spacing: 9) {
                        Label("时间的朋友", systemImage: "sparkles")
                            .font(.system(size: 17, weight: .bold))
                            .foregroundStyle(store.theme.primary)
                        Text("连续打卡 \(stats.streakDays) 天。保持节奏，比追求完美更重要。")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(.secondary)
                            .lineSpacing(4)
                    }
                    Spacer()
                    Text("\(stats.streakDays)D")
                        .font(.system(size: 21, weight: .bold, design: .rounded))
                        .foregroundStyle(.secondary)
                        .frame(width: 58, height: 58)
                        .background(store.theme.panelBackground, in: Circle())
                        .overlay { Circle().stroke(store.theme.border) }
                }
                .padding(20)
                .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 18))
                .overlay { RoundedRectangle(cornerRadius: 18).stroke(store.theme.border) }

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 14) {
                    StatTile(symbol: "clock", title: "今日专注时长", value: "\(stats.todayMinutes)", unit: "分钟")
                    StatTile(symbol: "checkmark.circle", title: "今日打卡次数", value: "\(stats.todayTomatoes)", unit: "次")
                    StatTile(symbol: "calendar", title: "本周累计时长", value: "\(stats.weekMinutes)", unit: "分钟")
                    StatTile(symbol: "trophy", title: "本月累计时长", value: "\(stats.monthMinutes)", unit: "分钟")
                }

                VStack(spacing: 0) {
                    detailRow("完成任务总计", "\(stats.completedTasks) 个")
                    detailRow("本周打卡量 (达标25m+)", "\(stats.weekTomatoes) 次")
                    detailRow("本月打卡量 (达标25m+)", "\(stats.monthTomatoes) 次")
                    detailRow("单周最稳频率", "良好", showDivider: false)
                }
                .padding(16)
                .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 18))
                .overlay { RoundedRectangle(cornerRadius: 18).stroke(store.theme.border) }
            }
        }
    }

    private func detailRow(_ title: String, _ value: String, showDivider: Bool = true) -> some View {
        VStack(spacing: 0) {
            HStack {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.secondary)
                Spacer()
                Text(value)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(store.theme.primary)
            }
            .padding(.vertical, 9)
            if showDivider {
                Divider().background(store.theme.border)
            }
        }
    }
}

struct StatTile: View {
    @EnvironmentObject private var store: FocusStore
    let symbol: String
    let title: String
    let value: String
    let unit: String

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Label(title, systemImage: symbol)
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(.secondary)
            HStack(alignment: .lastTextBaseline, spacing: 3) {
                Text(value)
                    .font(.system(size: 31, weight: .bold, design: .rounded))
                    .foregroundStyle(store.theme.primary)
                    .monospacedDigit()
                Text(unit)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .background(store.theme.panelBackground, in: RoundedRectangle(cornerRadius: 16))
        .overlay {
            RoundedRectangle(cornerRadius: 16).stroke(store.theme.border)
        }
        .shadow(color: store.theme.primary.opacity(0.06), radius: 7, y: 4)
    }
}

