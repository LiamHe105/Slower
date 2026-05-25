import SwiftUI

struct TasksView: View {
    @EnvironmentObject private var store: FocusStore
    @State private var taskName = ""
    @State private var filter: TaskFilter = .active
    @State private var goalText = ""
    @State private var goalMinutesText = "120"
    @State private var showInvalidGoalAlert = false

    private var activeTasks: [TaskItem] { store.tasks.filter { !$0.completed } }
    private var completedTasks: [TaskItem] { store.tasks.filter { $0.completed } }
    private var visibleTasks: [TaskItem] {
        switch filter {
        case .active: activeTasks
        case .completed: completedTasks
        case .all: store.tasks
        }
    }

    var body: some View {
        HStack(alignment: .top, spacing: 20) {
            taskList
            todayGoalPanel
                .frame(width: 310)
        }
        .frame(maxWidth: 980, alignment: .top)
        .onAppear {
            goalText = store.activeTodayGoalText
            goalMinutesText = "\(store.activeTodayGoalMinutes ?? 120)"
        }
        .alert(store.language.text("请输入合适的时间哟～", "Please enter a valid time."), isPresented: $showInvalidGoalAlert) {
            Button(store.language.text("知道了", "OK"), role: .cancel) { }
        }
    }

    private var taskList: some View {
        SectionCard(maxWidth: 650) {
            VStack(alignment: .leading, spacing: 20) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 5) {
                        Label(store.language.text("今日任务清单", "Today's Tasks"), systemImage: "checkmark.circle")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundStyle(store.theme.primary)
                        Text(store.language.text("创建今天要推进的任务", "Create the tasks you want to move forward today."))
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Text(store.language.text("待办 \(activeTasks.count)  /  已成 \(completedTasks.count)", "Open \(activeTasks.count) / Done \(completedTasks.count)"))
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(store.theme.primary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(store.theme.cardBackground, in: Capsule())
                }

                TaskFilterTabs(filter: $filter, active: activeTasks.count, completed: completedTasks.count, all: store.tasks.count)

                HStack(spacing: 10) {
                    TextField(store.language.text("今天打算专注于做什么？", "What do you want to focus on today?"), text: $taskName)
                        .textFieldStyle(.plain)
                        .font(.system(size: 15, weight: .semibold))
                        .padding(.horizontal, 14)
                        .frame(height: 42)
                        .background(.white.opacity(0.78), in: RoundedRectangle(cornerRadius: 14))
                        .overlay { RoundedRectangle(cornerRadius: 14).stroke(store.theme.border) }
                        .onSubmit(addTask)
                    Button(action: addTask) {
                        Image(systemName: "plus")
                            .font(.system(size: 18, weight: .semibold))
                            .frame(width: 40, height: 40)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(store.theme.primary)
                }
                .padding(14)
                .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 18))
                .overlay { RoundedRectangle(cornerRadius: 18).stroke(store.theme.border) }

                VStack(spacing: 10) {
                    if visibleTasks.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "checkmark.circle")
                                .font(.system(size: 28))
                                .foregroundStyle(.secondary.opacity(0.35))
                            Text(filter == .active ? store.language.text("没有待办，快去新增一个吧！", "No open tasks. Add one.") : store.language.text("暂无任务", "No tasks yet."))
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity, minHeight: 150)
                        .background(store.theme.cardBackground.opacity(0.7), in: RoundedRectangle(cornerRadius: 18))
                        .overlay {
                            RoundedRectangle(cornerRadius: 18)
                                .stroke(store.theme.border, style: StrokeStyle(lineWidth: 1, dash: [4, 4]))
                        }
                    } else {
                        ForEach(visibleTasks) { task in
                            TaskRow(task: task)
                        }
                    }
                }
            }
        }
    }

    private var todayGoalPanel: some View {
        SectionCard {
            VStack(alignment: .leading, spacing: 16) {
                Label(store.language.text("今日目标", "Today's Goal"), systemImage: "flag")
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundStyle(store.theme.primary)

                VStack(alignment: .leading, spacing: 8) {
                    Text(store.language.text("写给自己的话", "Note to yourself"))
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                    TextField("", text: $goalText)
                        .textFieldStyle(.roundedBorder)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text(store.language.text("自律时长", "Target focus time"))
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                    HStack {
                        TextField(store.language.text("分钟数", "Minutes"), text: $goalMinutesText)
                            .textFieldStyle(.roundedBorder)
                        Text(store.language.text("分钟", "min"))
                            .foregroundStyle(.secondary)
                    }
                }

                Button(store.language.text("保存今日目标", "Save Today's Goal")) {
                    guard let minutes = Int(goalMinutesText.trimmingCharacters(in: .whitespacesAndNewlines)),
                          minutes > 0,
                          minutes <= 1440 else {
                        showInvalidGoalAlert = true
                        return
                    }
                    store.updateTodayGoal(text: goalText, minutes: minutes)
                }
                .buttonStyle(.borderedProminent)
                .tint(store.theme.primary)

                Text(store.language.text("保存后会显示在左侧“今日奋斗目标”。", "After saving, it will appear in the sidebar goal card."))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func addTask() {
        store.addTask(named: taskName, modeID: store.activeModeID)
        taskName = ""
    }
}

enum TaskFilter: String, CaseIterable, Identifiable {
    case active
    case completed
    case all

    var id: String { rawValue }
}

struct TaskFilterTabs: View {
    @EnvironmentObject private var store: FocusStore
    @Binding var filter: TaskFilter
    let active: Int
    let completed: Int
    let all: Int

    var body: some View {
        HStack(spacing: 0) {
            tab(.active, store.language.text("待完成 (\(active))", "Open (\(active))"))
            tab(.completed, store.language.text("已完成 (\(completed))", "Done (\(completed))"))
            tab(.all, store.language.text("全部 (\(all))", "All (\(all))"))
        }
        .padding(3)
        .background(store.theme.cardBackground, in: RoundedRectangle(cornerRadius: 13))
        .overlay { RoundedRectangle(cornerRadius: 13).stroke(store.theme.border) }
    }

    private func tab(_ value: TaskFilter, _ title: String) -> some View {
        Button(title) { filter = value }
            .buttonStyle(.plain)
            .font(.system(size: 14, weight: .bold))
            .foregroundStyle(filter == value ? store.theme.primary : .secondary)
            .frame(maxWidth: .infinity)
            .frame(height: 34)
            .background(filter == value ? store.theme.panelBackground : .clear, in: RoundedRectangle(cornerRadius: 10))
    }
}

struct TaskRow: View {
    @EnvironmentObject private var store: FocusStore
    let task: TaskItem
    @State private var editingName = ""
    @State private var isEditing = false

    var body: some View {
        HStack(spacing: 12) {
            Button {
                store.toggleTask(task)
            } label: {
                Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(task.completed ? store.theme.primary : .secondary)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 4) {
                if isEditing {
                    TextField(store.language.text("任务名称", "Task name"), text: $editingName)
                        .textFieldStyle(.roundedBorder)
                        .onSubmit(save)
                } else {
                    Text(task.name)
                        .font(.system(size: 14, weight: .bold))
                        .strikethrough(task.completed)
                        .foregroundStyle(task.completed ? .secondary : .primary)
                }
                Text(store.language.text("累计 \(minutesText(task.totalFocusSeconds))", "Total \(minutesText(task.totalFocusSeconds, language: store.language))"))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button {
                editingName = task.name
                isEditing.toggle()
                if !isEditing { save() }
            } label: {
                Image(systemName: "pencil")
            }
            .foregroundStyle(.secondary)

            Button(role: .destructive) {
                store.deleteTask(task)
            } label: {
                Image(systemName: "trash")
            }
        }
        .buttonStyle(.plain)
        .padding(14)
        .background(store.theme.panelBackground, in: RoundedRectangle(cornerRadius: 14))
        .overlay {
            RoundedRectangle(cornerRadius: 14).stroke(store.theme.border.opacity(0.75))
        }
    }

    private func save() {
        store.updateTask(task, name: editingName)
        isEditing = false
    }
}
