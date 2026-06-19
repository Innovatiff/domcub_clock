import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Tab = .scan

    enum Tab {
        case scan, history, stats, more
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            ScanView()
                .tabItem {
                    Label("Scan", systemImage: "camera")
                }
                .tag(Tab.scan)

            HistoryView()
                .tabItem {
                    Label("History", systemImage: "clock")
                }
                .tag(Tab.history)

            StatsView()
                .tabItem {
                    Label("Stats", systemImage: "chart.bar")
                }
                .tag(Tab.stats)

            MoreView()
                .tabItem {
                    Label("More", systemImage: "line.3.horizontal")
                }
                .tag(Tab.more)
        }
        .tint(Color(red: 0.851, green: 0.467, blue: 0.024)) // #D97706 amber
    }
}

// MARK: - Placeholder tab views

struct ScanView: View {
    var body: some View {
        NavigationStack {
            Text("Scan")
                .navigationTitle("Scan")
        }
    }
}

struct HistoryView: View {
    var body: some View {
        NavigationStack {
            Text("History")
                .navigationTitle("History")
        }
    }
}

struct StatsView: View {
    var body: some View {
        NavigationStack {
            Text("Stats")
                .navigationTitle("Stats")
        }
    }
}

struct MoreView: View {
    var body: some View {
        NavigationStack {
            Text("More")
                .navigationTitle("More")
        }
    }
}

#Preview {
    ContentView()
}
