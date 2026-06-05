import SwiftUI
import WidgetKit

struct ScholarQuoteWidget: Widget {
    let kind: String = "ScholarQuoteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: QuoteProvider()) { entry in
            QuoteWidgetView(entry: entry)
        }
        .configurationDisplayName("Scholar Quote")
        .description("Daily wisdom from classical Islamic scholars on your home screen.")
        .supportedFamilies([.systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

@main
struct ScholarQuoteWidgetBundle: WidgetBundle {
    var body: some Widget {
        ScholarQuoteWidget()
    }
}

#Preview(as: .systemMedium) {
    ScholarQuoteWidget()
} timeline: {
    QuoteEntry(date: .now, quote: .placeholder)
}

#Preview(as: .systemLarge) {
    ScholarQuoteWidget()
} timeline: {
    QuoteEntry(date: .now, quote: .placeholder)
}
