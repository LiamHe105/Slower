import SwiftUI

struct CalendarView: View {
    @EnvironmentObject private var store: FocusStore
    @State private var monthDate = Date()
    @State private var selectedDate = Date()

    var body: some View {
        HStack(alignment: .top, spacing: 22) {
            calendarCard
            CalendarDetailPanel(selectedDate: $selectedDate)
                .frame(width: 360)
        }
        .frame(maxWidth: 1040, alignment: .top)
    }

    private var calendarCard: some View {
        SectionCard(maxWidth: 610) {
            VStack(alignment: .leading, spacing: 24) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 5) {
                        Label(store.language.text("打卡律动历", "Discipline Calendar"), systemImage: "calendar")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundStyle(store.theme.primary)
                        Text(store.language.text("连续专注与日均坚持反馈", "Track consistency and daily focus rhythm."))
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    HStack(spacing: 8) {
                        navButton("chevron.left") { moveMonth(-1) }
                        Button(store.language.text("本月", "This Month")) {
                            monthDate = Date()
                            selectedDate = Date()
                        }
                        .buttonStyle(.plain)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(store.theme.primary)
                        .frame(height: 34)
                        .padding(.horizontal, 12)
                        .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 10))
                        .overlay { RoundedRectangle(cornerRadius: 10).stroke(store.theme.border) }
                        navButton("chevron.right") { moveMonth(1) }
                    }
                }

                Text(monthTitle)
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundStyle(store.theme.primary)
                    .frame(maxWidth: .infinity)

                weekdayHeader

                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 14), count: 7), spacing: 12) {
                    ForEach(days.indices, id: \.self) { index in
                        if let day = days[index] {
                            dayCell(day)
                        } else {
                            Color.clear.frame(width: 36, height: 36)
                        }
                    }
                }
                .padding(.horizontal, 10)

                Divider()
                    .background(store.theme.border)

                legend
            }
        }
    }

    private var weekdayHeader: some View {
        let names = store.language == .chinese ? ["日", "一", "二", "三", "四", "五", "六"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        return HStack {
            ForEach(names, id: \.self) { name in
                Text(name)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal, 10)
    }

    private func dayCell(_ day: Int) -> some View {
        let date = dateFor(day)
        let key = date.dayKey
        let summary = store.dailySummary(for: monthDate)[key]
        let minutes = Int(((summary?.seconds ?? 0) / 60).rounded())
        let seconds = summary?.seconds ?? 0
        let isToday = Calendar.app.isDateInToday(date)
        let isSelected = Calendar.app.isDate(date, inSameDayAs: selectedDate)

        return Button {
            selectedDate = date
        } label: {
            Text("\(day)")
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundStyle(minutes >= 120 ? .white : store.theme.primary)
                .frame(width: 36, height: 36)
                .background(colorForMinutes(minutes), in: Circle())
                .overlay {
                    Circle()
                        .stroke(isSelected ? store.theme.primary : (isToday ? Color.primary : .clear), lineWidth: isSelected ? 3 : 2)
                        .padding(isSelected ? -5 : -4)
                }
        }
        .buttonStyle(.plain)
        .help(store.language.text("\(key) 专注 \(minutesText(seconds))", "\(key) focused \(minutesText(seconds, language: store.language))"))
        .frame(maxWidth: .infinity)
    }

    private var legend: some View {
        HStack(spacing: 12) {
            Text(store.language.text("专注强度说明:", "Intensity:"))
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(.secondary)
            Spacer()
            legendItem(store.language.text("<15分钟", "<15 min"), color: store.theme.cardBackground)
            legendItem(store.language.text("15分钟+", "15+ min"), color: store.theme.primary.opacity(0.18))
            legendItem(store.language.text("60分钟+", "60+ min"), color: store.theme.primary.opacity(0.38))
            legendItem(store.language.text("120分钟+", "120+ min"), color: store.theme.primary)
        }
    }

    private func legendItem(_ title: String, color: Color) -> some View {
        HStack(spacing: 5) {
            Circle()
                .fill(color)
                .frame(width: 9, height: 9)
                .overlay { Circle().stroke(store.theme.border) }
            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(.secondary)
        }
    }

    private func navButton(_ symbol: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: 14, weight: .bold))
                .frame(width: 34, height: 34)
                .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 10))
                .overlay { RoundedRectangle(cornerRadius: 10).stroke(store.theme.border) }
        }
        .buttonStyle(.plain)
        .foregroundStyle(store.theme.primary)
    }

    private var monthTitle: String {
        store.language.date(monthDate, format: .month)
    }

    private var days: [Int?] {
        let calendar = Calendar.app
        let interval = calendar.dateInterval(of: .month, for: monthDate)!
        let firstWeekday = calendar.component(.weekday, from: interval.start)
        let range = calendar.range(of: .day, in: .month, for: monthDate)!
        return Array(repeating: nil, count: firstWeekday - 1) + range.map { Optional($0) }
    }

    private func dateFor(_ day: Int) -> Date {
        var components = Calendar.app.dateComponents([.year, .month], from: monthDate)
        components.day = day
        return Calendar.app.date(from: components) ?? Date()
    }

    private func moveMonth(_ value: Int) {
        monthDate = Calendar.app.date(byAdding: .month, value: value, to: monthDate) ?? monthDate
        if !Calendar.app.isDate(selectedDate, equalTo: monthDate, toGranularity: .month) {
            selectedDate = monthDate
        }
    }

    private func colorForMinutes(_ minutes: Int) -> Color {
        if minutes < 15 { return store.theme.cardBackground }
        if minutes < 60 { return store.theme.primary.opacity(0.18) }
        if minutes < 120 { return store.theme.primary.opacity(0.38) }
        return store.theme.primary
    }
}

struct CalendarDetailPanel: View {
    @EnvironmentObject private var store: FocusStore
    @Binding var selectedDate: Date
    @State private var draftNote = ""
    @State private var isEditingNote = false
    @FocusState private var noteFocused: Bool

    var body: some View {
        SectionCard {
            ScrollView(.vertical) {
                VStack(alignment: .leading, spacing: 18) {
                    header
                    summary
                    history
                    noteEditor
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .scrollIndicators(.automatic)
            .frame(maxHeight: 560)
        }
        .onAppear {
            draftNote = store.note(for: selectedDate)
            isEditingNote = false
        }
        .onChange(of: selectedDate) { _, newValue in
            draftNote = store.note(for: newValue)
            isEditingNote = false
            noteFocused = false
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 5) {
            Label(store.language.text("日期详情", "Date Details"), systemImage: "doc.text.magnifyingglass")
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundStyle(store.theme.primary)
            Text(selectedTitle)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(.secondary)
        }
    }

    private var summary: some View {
        let sessions = store.sessions(on: selectedDate)
        let minutes = Int((sessions.reduce(0) { $0 + $1.durationSeconds } / 60).rounded())
        let tomatoes = sessions.filter(\.isCompletedTomato).count
        let weekMinutes = periodMinutes(containing: selectedDate, component: .weekOfYear)
        let monthMinutes = periodMinutes(containing: selectedDate, component: .month)

        return LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
            detailMetric(store.language.text("当天专注", "Selected Day"), "\(minutes)", store.language.text("分钟", "min"))
            detailMetric(store.language.text("当天打卡", "Check-ins"), "\(tomatoes)", store.language.text("次", "x"))
            detailMetric(store.language.text("本周专注", "This Week"), "\(weekMinutes)", store.language.text("分钟", "min"))
            detailMetric(store.language.text("本月专注", "This Month"), "\(monthMinutes)", store.language.text("分钟", "min"))
        }
    }

    private var history: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(store.language.text("专注历史", "Focus History"))
                .font(.system(size: 15, weight: .bold))

            let sessions = store.sessions(on: selectedDate)
            if sessions.isEmpty {
                Text(store.language.text("这一天还没有专注记录。", "No focus records on this day."))
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(14)
                    .background(store.theme.cardBackground.opacity(0.7), in: RoundedRectangle(cornerRadius: 12))
            } else {
                ForEach(sessions) { session in
                    HistorySessionRow(session: session)
                }
            }
        }
    }

    private var noteEditor: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(store.language.text("当天小结", "Daily Note"))
                    .font(.system(size: 15, weight: .bold))
                Spacer()
                Button(isEditingNote ? store.language.text("保存", "Save") : store.language.text("编辑", "Edit")) {
                    if isEditingNote {
                        store.updateNote(draftNote, for: selectedDate)
                        isEditingNote = false
                        noteFocused = false
                    } else {
                        draftNote = store.note(for: selectedDate)
                        isEditingNote = true
                        DispatchQueue.main.async {
                            noteFocused = true
                        }
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(store.theme.primary)
                .controlSize(.small)
            }

            if isEditingNote {
                TextEditor(text: $draftNote)
                    .font(.system(size: 13))
                    .focused($noteFocused)
                    .frame(minHeight: 110)
                    .scrollContentBackground(.hidden)
                    .padding(8)
                    .background(.white.opacity(0.62), in: RoundedRectangle(cornerRadius: 12))
                    .overlay {
                        RoundedRectangle(cornerRadius: 12).stroke(store.theme.border)
                    }
            } else {
                Text(draftNote.isEmpty ? store.language.text("还没有写下当天小结。", "No daily note yet.") : draftNote)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(draftNote.isEmpty ? .secondary : .primary)
                    .lineSpacing(4)
                    .frame(maxWidth: .infinity, minHeight: 110, alignment: .topLeading)
                    .padding(12)
                    .background(store.theme.cardBackground.opacity(0.7), in: RoundedRectangle(cornerRadius: 12))
                    .overlay {
                        RoundedRectangle(cornerRadius: 12).stroke(store.theme.border)
                    }
            }
        }
    }

    private func detailMetric(_ title: String, _ value: String, _ unit: String) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            HStack(alignment: .lastTextBaseline, spacing: 2) {
                Text(value)
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundStyle(store.theme.primary)
                Text(unit)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 12))
        .overlay {
            RoundedRectangle(cornerRadius: 12).stroke(store.theme.border)
        }
    }

    private func periodMinutes(containing date: Date, component: Calendar.Component) -> Int {
        guard let interval = Calendar.app.dateInterval(of: component, for: date) else { return 0 }
        let seconds = store.sessions
            .filter { !$0.isBreak && interval.contains($0.endedAt) }
            .reduce(0) { $0 + $1.durationSeconds }
        return Int((seconds / 60).rounded())
    }

    private var selectedTitle: String {
        store.language.date(selectedDate, format: .header)
    }

    private func timeText(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }
}

struct HistorySessionRow: View {
    @EnvironmentObject private var store: FocusStore
    let session: FocusSession
    @State private var isHovering = false
    @State private var showingDeleteConfirm = false

    var body: some View {
        ZStack(alignment: .topTrailing) {
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: store.modeSymbol(for: session.modeID))
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(store.theme.primary)
                    .frame(width: 24, height: 24)
                    .background(store.theme.cardBackground, in: Circle())
                VStack(alignment: .leading, spacing: 5) {
                    HStack {
                        Text(store.taskName(for: session.taskID))
                            .font(.system(size: 13, weight: .bold))
                            .lineLimit(1)
                        Spacer()
                        Text(timeText(session.endedAt))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .padding(.trailing, isHovering ? 24 : 0)
                    }
                    HStack(spacing: 8) {
                        Text(minutesText(session.durationSeconds))
                        Text(store.modeName(for: session.modeID))
                            .foregroundStyle(store.theme.primary)
                        if session.isCompletedTomato {
                                Text(store.language.text("达标", "Done"))
                                .foregroundStyle(store.theme.primary)
                        }
                    }
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                }
            }
            .padding(12)

            if isHovering {
                Button {
                    showingDeleteConfirm = true
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(.red)
                        .padding(9)
                }
                .buttonStyle(.plain)
                .transition(.opacity)
            }
        }
        .background(store.theme.cardBackground.opacity(0.75), in: RoundedRectangle(cornerRadius: 12))
        .onHover { hovering in
            withAnimation(.easeOut(duration: 0.12)) {
                isHovering = hovering
            }
        }
        .alert(store.language.text("删除这条专注历史？", "Delete this focus record?"), isPresented: $showingDeleteConfirm) {
            Button(store.language.text("取消", "Cancel"), role: .cancel) { }
            Button(store.language.text("删除", "Delete"), role: .destructive) {
                store.deleteSession(session)
            }
        } message: {
            Text(store.language.text("删除后会同步扣回该任务累计专注时长。", "Deleting it will also subtract the time from the linked task total."))
        }
    }

    private func timeText(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }
}
