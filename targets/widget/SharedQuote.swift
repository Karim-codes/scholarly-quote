import Foundation

/// Mirrors the JSON shape that the React Native side writes into the shared
/// App Group via `ExtensionStorage.set("daily_quote", ...)`.
struct SharedQuote: Codable {
    let id: String
    let text: String
    let scholarName: String
    let scholarInitials: String
    let bookTitle: String
    let topic: String
    let accentHex: String
    let updatedAt: TimeInterval

    static let appGroup = "group.com.scholarquote.app"
    static let storageKey = "daily_quote"

    /// Reads the latest daily quote from the shared App Group.
    /// Falls back to a built-in placeholder so the widget gallery preview never
    /// shows an empty state.
    static func load() -> SharedQuote {
        guard
            let defaults = UserDefaults(suiteName: appGroup),
            let raw = defaults.string(forKey: storageKey),
            let data = raw.data(using: .utf8),
            let decoded = try? JSONDecoder().decode(SharedQuote.self, from: data)
        else {
            return .placeholder
        }
        return decoded
    }

    static let placeholder = SharedQuote(
        id: "placeholder",
        text: "Knowledge is what benefits, not what is merely memorised.",
        scholarName: "Ibn Qayyim al-Jawziyyah",
        scholarInitials: "IQ",
        bookTitle: "Al-Fawaid",
        topic: "Knowledge",
        accentHex: "#c4a882",
        updatedAt: Date().timeIntervalSince1970
    )
}
