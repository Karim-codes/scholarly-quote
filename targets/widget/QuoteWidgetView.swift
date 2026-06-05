import SwiftUI
import WidgetKit

struct QuoteWidgetView: View {
    @Environment(\.widgetFamily) var family
    let entry: QuoteEntry

    var body: some View {
        switch family {
        case .systemLarge:
            LargeQuoteView(quote: entry.quote)
        default:
            MediumQuoteView(quote: entry.quote)
        }
    }
}

private struct MediumQuoteView: View {
    let quote: SharedQuote

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            TopicBadge(topic: quote.topic, accent: Color(hex: quote.accentHex))

            Text(quote.text)
                .font(.system(size: 15, weight: .regular, design: .default))
                .foregroundStyle(.white)
                .lineLimit(4)
                .minimumScaleFactor(0.85)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, alignment: .leading)

            Attribution(quote: quote, compact: true)
                .padding(.top, 2)
        }
        .frame(maxHeight: .infinity, alignment: .center)
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .containerBackground(for: .widget) {
            Color(hex: "#0a0a0a")
        }
        .widgetURL(URL(string: "scholarquote://quote/\(quote.id)"))
    }
}

private struct LargeQuoteView: View {
    let quote: SharedQuote

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                TopicBadge(topic: quote.topic, accent: Color(hex: quote.accentHex))
                Spacer()
                Text("Scholar Quote")
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(1.5)
                    .foregroundStyle(Color.white.opacity(0.4))
            }

            Text(quote.text)
                .font(.system(size: 19, weight: .regular))
                .foregroundStyle(.white)
                .lineLimit(nil)
                .minimumScaleFactor(0.85)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, alignment: .leading)

            Rectangle()
                .fill(Color.white.opacity(0.08))
                .frame(height: 1)
                .padding(.top, 4)

            Attribution(quote: quote, compact: false)
        }
        // Center the whole stack vertically so short quotes don't sit at the
        // top with a huge empty area below.
        .frame(maxHeight: .infinity, alignment: .center)
        .padding(.horizontal, 18)
        .padding(.vertical, 16)
        .containerBackground(for: .widget) {
            Color(hex: "#0a0a0a")
        }
        .widgetURL(URL(string: "scholarquote://quote/\(quote.id)"))
    }
}

private struct TopicBadge: View {
    let topic: String
    let accent: Color

    var body: some View {
        Text(topic.uppercased())
            .font(.system(size: 10, weight: .semibold))
            .tracking(0.6)
            .foregroundStyle(accent)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(accent.opacity(0.12), in: Capsule())
    }
}

private struct Attribution: View {
    let quote: SharedQuote
    let compact: Bool

    var body: some View {
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(Color(hex: quote.accentHex).opacity(0.18))
                Text(quote.scholarInitials)
                    .font(.system(size: compact ? 10 : 12, weight: .semibold))
                    .foregroundStyle(Color(hex: quote.accentHex))
            }
            .frame(width: compact ? 26 : 34, height: compact ? 26 : 34)

            VStack(alignment: .leading, spacing: 1) {
                Text(quote.scholarName)
                    .font(.system(size: compact ? 11 : 13, weight: .semibold))
                    .foregroundStyle(.white)
                    .lineLimit(1)
                Text(quote.bookTitle)
                    .font(.system(size: compact ? 10 : 11, weight: .regular))
                    .foregroundStyle(Color.white.opacity(0.5))
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
        }
    }
}
