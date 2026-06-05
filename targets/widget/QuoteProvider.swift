import WidgetKit

struct QuoteEntry: TimelineEntry {
    let date: Date
    let quote: SharedQuote
}

struct QuoteProvider: TimelineProvider {
    func placeholder(in context: Context) -> QuoteEntry {
        QuoteEntry(date: Date(), quote: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (QuoteEntry) -> Void) {
        let entry = QuoteEntry(
            date: Date(),
            quote: context.isPreview ? .placeholder : SharedQuote.load()
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuoteEntry>) -> Void) {
        let now = Date()
        let entry = QuoteEntry(date: now, quote: SharedQuote.load())

        // Refresh tomorrow at midnight so the "daily" quote rotates with the
        // app's calendar-based selection. The host app also calls
        // `WidgetCenter.shared.reloadAllTimelines()` whenever a new quote is
        // written to the App Group, so this is just a safety net.
        let nextMidnight = Calendar.current.nextDate(
            after: now,
            matching: DateComponents(hour: 0, minute: 1),
            matchingPolicy: .nextTime
        ) ?? now.addingTimeInterval(60 * 60 * 6)

        completion(Timeline(entries: [entry], policy: .after(nextMidnight)))
    }
}
