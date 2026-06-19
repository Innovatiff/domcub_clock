import SwiftUI
import FirebaseCore
import RevenueCat

@main
struct LensApp: App {
    init() {
        FirebaseApp.configure()

        Purchases.logLevel = .debug
        Purchases.configure(withAPIKey: "YOUR_REVENUECAT_API_KEY")
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
