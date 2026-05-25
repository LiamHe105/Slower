import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: FocusStore
    @State private var selection: AppPage = .focus

    var body: some View {
        NavigationSplitView {
            AppSidebar(selection: $selection)
                .navigationSplitViewColumnWidth(min: 220, ideal: 240, max: 280)
        } detail: {
            ZStack(alignment: .top) {
                store.theme.pageBackground.ignoresSafeArea()
                detailView
                    .padding(.top, 126)
                    .padding(.horizontal, 36)
                    .padding(.bottom, 28)

                AppHeader()
                    .frame(height: 96)
                    .zIndex(10)
            }
            .background(store.theme.pageBackground)
        }
        .background(store.theme.pageBackground)
        .sheet(item: $store.settlement) { session in
            SettlementView(session: session)
        }
    }

    @ViewBuilder
    private var detailView: some View {
        switch selection {
        case .focus:
            FocusView()
        case .tasks:
            ScrollView(.vertical) {
                TasksView()
                    .frame(maxWidth: .infinity)
            }
            .scrollIndicators(.automatic)
        case .calendar:
            ScrollView(.vertical) {
                CalendarView()
                    .frame(maxWidth: .infinity)
            }
            .scrollIndicators(.automatic)
        case .stats:
            ScrollView(.vertical) {
                StatsView()
                    .frame(maxWidth: .infinity)
            }
            .scrollIndicators(.automatic)
        }
    }
}

struct AppSidebar: View {
    @EnvironmentObject private var store: FocusStore
    @Binding var selection: AppPage
    @State private var showingAuthor = false

    var body: some View {
        GeometryReader { proxy in
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .center, spacing: 14) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Slower")
                            .font(.system(size: 23, weight: .bold, design: .rounded))
                            .foregroundStyle(store.theme.primary)
                            .lineLimit(1)
                        Text("Slow your world,not your goals.")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                    }
                }
                .padding(.top, 34)
                .padding(.horizontal, 28)

                VStack(spacing: 14) {
                    ForEach(AppPage.allCases) { page in
                        SidebarRow(page: page, isSelected: selection == page) {
                            selection = page
                        }
                    }
                }
                .padding(.top, 58)
                .padding(.horizontal, 18)

                Spacer(minLength: 12)

                if proxy.size.height > 560 {
                    VStack(spacing: 12) {
                        TodayGoalCard(compact: proxy.size.height < 710)
                        AuthorCreditView {
                            showingAuthor = true
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)
                }
            }
            .frame(width: proxy.size.width, height: proxy.size.height)
        }
        .background(store.theme.sidebarBackground)
        .sheet(isPresented: $showingAuthor) {
            AuthorSupportView()
                .environmentObject(store)
        }
    }
}

struct SidebarRow: View {
    @EnvironmentObject private var store: FocusStore
    let page: AppPage
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: page.symbol)
                    .font(.system(size: 16, weight: .semibold))
                    .frame(width: 20)
                Text(page.sidebarTitle(language: store.language))
                    .font(.system(size: 15, weight: .semibold))
                Spacer()
            }
            .foregroundStyle(isSelected ? store.theme.primary : .secondary)
            .padding(.horizontal, 20)
            .frame(height: 44)
            .background(isSelected ? store.theme.cardBackground : .clear, in: RoundedRectangle(cornerRadius: 15))
            .overlay {
                RoundedRectangle(cornerRadius: 15)
                    .stroke(isSelected ? store.theme.primary : .clear, lineWidth: 1.8)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

struct AppHeader: View {
    @EnvironmentObject private var store: FocusStore

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 3) {
                Text(headerDate)
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundStyle(store.theme.primary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.82)
                Text(store.language.text("在自律节拍中，寻找内心的专注与安宁。", "Slow your world, not your goals."))
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)
            }
            Spacer()
        }
        .padding(.horizontal, 48)
        .padding(.vertical, 16)
        .background(store.theme.panelBackground)
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(store.theme.border)
                .frame(height: 1)
                .shadow(color: store.theme.primary.opacity(0.16), radius: 4, y: 2)
        }
    }

    private var headerDate: String {
        return store.language.date(Date(), format: .header)
    }
}

struct TodayGoalCard: View {
    @EnvironmentObject private var store: FocusStore
    var compact = false

    var body: some View {
        let stats = store.stats()
        VStack(alignment: .leading, spacing: compact ? 8 : 12) {
            Text(store.language.text("今日奋斗目标", "Today's Goal"))
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(.secondary)
            if let target = store.activeTodayGoalMinutes {
                HStack(alignment: .lastTextBaseline) {
                    Text("\(stats.todayMinutes)/\(target)")
                        .font(.system(size: compact ? 22 : 25, weight: .bold, design: .rounded))
                        .foregroundStyle(store.theme.primary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.65)
                    Spacer()
                    Text(store.language.text("分钟", "min"))
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.secondary)
                }
                if !store.activeTodayGoalText.isEmpty {
                    Text(store.activeTodayGoalText)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.secondary)
                        .lineLimit(compact ? 1 : 2)
                        .minimumScaleFactor(0.8)
                }
                if !compact {
                    ProgressView(value: Double(stats.todayMinutes), total: Double(max(target, 1)))
                        .tint(store.theme.primary)
                        .controlSize(.small)
                }
            } else {
                Text(store.language.text("请前往“待办清单”设置今日目标！", "Go to Tasks to set today's goal."))
                    .font(.system(size: compact ? 12 : 13, weight: .bold))
                    .foregroundStyle(store.theme.primary)
                    .lineLimit(3)
                    .minimumScaleFactor(0.75)
            }
        }
        .padding(compact ? 14 : 18)
        .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 18))
        .overlay {
            RoundedRectangle(cornerRadius: 18).stroke(store.theme.border, lineWidth: 1)
        }
        .shadow(color: store.theme.primary.opacity(0.10), radius: 10, y: 5)
    }
}

struct AuthorCreditView: View {
    @EnvironmentObject private var store: FocusStore
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 3) {
                Text("by @LiamHe")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                Text("2026")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .foregroundStyle(store.theme.primary)
        .padding(.horizontal, 4)
    }
}

struct AuthorSupportView: View {
    @EnvironmentObject private var store: FocusStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 5) {
                    Text("@LiamHe")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundStyle(store.theme.primary)
                    Text(store.language.text("一位 Aspiring 游戏策划 × AI 开发记录", "Aspiring game designer × AI dev journal"))
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(.secondary)
                }
                .buttonStyle(.plain)
            }

            Text(store.language.text("""
            软件工程学生 / aspiring game designer

            这里会分享我学习 vibe coding 的过程，
            还有一些正在制作中的 AI 工具、游戏想法和独立产品。

            我不是什么大厂工程师，
            只是一个正在慢慢把脑子里的想法做出来的人。

            如果你愿意支持我的创作，
            欢迎来和我一起见证这些项目从 0 到 1。
            """, """
            Software engineering student / aspiring game designer

            I share my vibe coding process here, along with AI tools, game ideas, and indie products I am building.

            I am not a big-tech engineer, just someone slowly turning ideas into real things.

            If you want to support my work, you are welcome to witness these projects going from 0 to 1.
            """))
            .font(.system(size: 14, weight: .medium))
            .lineSpacing(5)
            .foregroundStyle(.primary)

            VStack(spacing: 10) {
                supportLink("GitHub", systemImage: "chevron.left.forwardslash.chevron.right", url: "https://github.com/LiamHe105")
                supportLink(store.language.text("爱发电", "Afdian"), systemImage: "heart.fill", url: "https://ifdian.net/a/liamhe")
                supportLink(store.language.text("抖音", "Douyin"), systemImage: "play.rectangle.fill", url: "https://v.douyin.com/IJ0zrxYSCHA/")
            }
        }
        .padding(26)
        .frame(width: 420)
        .background(store.theme.panelBackground)
    }

    private func supportLink(_ title: String, systemImage: String, url: String) -> some View {
        Link(destination: URL(string: url)!) {
            HStack {
                Image(systemName: systemImage)
                    .frame(width: 22)
                Text(title)
                    .font(.system(size: 14, weight: .bold))
                Spacer()
                Image(systemName: "arrow.up.right")
                    .font(.system(size: 12, weight: .bold))
            }
            .foregroundStyle(store.theme.primary)
            .padding(.horizontal, 14)
            .frame(height: 42)
            .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 12))
            .overlay {
                RoundedRectangle(cornerRadius: 12).stroke(store.theme.border)
            }
        }
        .buttonStyle(.plain)
    }
}

struct SectionCard<Content: View>: View {
    @EnvironmentObject private var store: FocusStore
    let maxWidth: CGFloat?
    let content: Content

    init(maxWidth: CGFloat? = nil, @ViewBuilder content: () -> Content) {
        self.maxWidth = maxWidth
        self.content = content()
    }

    var body: some View {
        content
            .padding(26)
            .frame(maxWidth: maxWidth)
            .background(store.theme.panelBackground, in: RoundedRectangle(cornerRadius: 22))
            .overlay {
                RoundedRectangle(cornerRadius: 22)
                    .stroke(store.theme.border, lineWidth: 1.2)
            }
            .shadow(color: store.theme.primary.opacity(0.08), radius: 18, y: 8)
    }
}

extension AppPage {
    func sidebarTitle(language: AppLanguage) -> String {
        switch self {
        case .focus: language.text("我的专注", "Focus")
        case .tasks: language.text("待办清单", "Tasks")
        case .calendar: language.text("自律历程", "Journey")
        case .stats: language.text("成效大观", "Stats")
        }
    }
}
