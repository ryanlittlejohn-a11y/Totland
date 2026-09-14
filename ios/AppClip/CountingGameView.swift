import StoreKit
import SwiftUI

private struct CountingRound {
    let symbol: String
    let count: Int
    let choices: [Int]
}

struct CountingGameView: View {
    private let rounds = [
        CountingRound(symbol: "🍎", count: 2, choices: [1, 2, 3]),
        CountingRound(symbol: "⭐️", count: 4, choices: [3, 4, 5]),
        CountingRound(symbol: "🐞", count: 3, choices: [2, 3, 4]),
    ]

    @State private var roundIndex = 0
    @State private var message = "How many can you count?"
    @State private var selectedAnswer: Int?
    @State private var isComplete = false
    @State private var overlay: SKOverlay?

    private let cream = Color(red: 0.97, green: 0.93, blue: 0.86)
    private let ink = Color(red: 0.30, green: 0.23, blue: 0.18)
    private let clay = Color(red: 0.80, green: 0.32, blue: 0.17)
    private let moss = Color(red: 0.38, green: 0.59, blue: 0.31)
    private let amber = Color(red: 0.96, green: 0.68, blue: 0.17)

    var body: some View {
        ZStack {
            cream.ignoresSafeArea()

            if isComplete {
                completionView
            } else {
                gameView
            }
        }
        .foregroundStyle(ink)
    }

    private var gameView: some View {
        let round = rounds[roundIndex]

        return VStack(spacing: 24) {
            VStack(spacing: 4) {
                Text("TOTLAND")
                    .font(.system(size: 17, weight: .black, design: .rounded))
                    .foregroundStyle(clay)
                Text("Count with me!")
                    .font(.system(size: 32, weight: .black, design: .rounded))
            }

            Text(message)
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .multilineTextAlignment(.center)
                .frame(minHeight: 48)
                .accessibilityLiveRegion(.assertive)

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 78), spacing: 14)], spacing: 14) {
                ForEach(0..<round.count, id: \.self) { item in
                    Text(round.symbol)
                        .font(.system(size: 52))
                        .accessibilityLabel("Item \(item + 1)")
                }
            }
            .frame(maxWidth: 340, minHeight: 160)
            .padding(20)
            .background(.white.opacity(0.72), in: RoundedRectangle(cornerRadius: 28))

            HStack(spacing: 14) {
                ForEach(round.choices, id: \.self) { answer in
                    Button {
                        choose(answer, correctAnswer: round.count)
                    } label: {
                        Text("\(answer)")
                            .font(.system(size: 32, weight: .black, design: .rounded))
                            .frame(width: 76, height: 76)
                            .background(answerColor(answer, correctAnswer: round.count), in: RoundedRectangle(cornerRadius: 20))
                            .foregroundStyle(.white)
                    }
                    .disabled(selectedAnswer != nil)
                    .accessibilityLabel("Answer \(answer)")
                }
            }

            HStack(spacing: 7) {
                ForEach(rounds.indices, id: \.self) { index in
                    Circle()
                        .fill(index <= roundIndex ? clay : ink.opacity(0.16))
                        .frame(width: 10, height: 10)
                }
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 30)
    }

    private var completionView: some View {
        VStack(spacing: 22) {
            Text("⭐️")
                .font(.system(size: 86))
                .accessibilityHidden(true)
            Text("You did it!")
                .font(.system(size: 38, weight: .black, design: .rounded))
            Text("Great counting! Keep playing and learning in the full Totland app.")
                .font(.system(size: 19, weight: .semibold, design: .rounded))
                .multilineTextAlignment(.center)
                .frame(maxWidth: 360)
            Button("Play again") {
                roundIndex = 0
                selectedAnswer = nil
                message = "How many can you count?"
                isComplete = false
            }
            .buttonStyle(TotlandButtonStyle(color: moss))

            Button("Get Totland") {
                showFullAppOverlay()
            }
            .buttonStyle(TotlandButtonStyle(color: clay))
        }
        .padding(30)
        .onAppear {
            showFullAppOverlay()
        }
    }

    private func answerColor(_ answer: Int, correctAnswer: Int) -> Color {
        guard selectedAnswer == answer else { return amber }
        return answer == correctAnswer ? moss : clay
    }

    private func choose(_ answer: Int, correctAnswer: Int) {
        selectedAnswer = answer
        if answer != correctAnswer {
            message = "Keep trying!"
            UINotificationFeedbackGenerator().notificationOccurred(.warning)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
                selectedAnswer = nil
                message = "How many can you count?"
            }
            return
        }

        message = "Great counting!"
        UINotificationFeedbackGenerator().notificationOccurred(.success)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.9) {
            if roundIndex == rounds.count - 1 {
                isComplete = true
            } else {
                roundIndex += 1
                selectedAnswer = nil
                message = "How many can you count?"
            }
        }
    }

    private func showFullAppOverlay() {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene else { return }
        let configuration = SKOverlay.AppConfiguration(
            appIdentifier: "6811231464",
            position: .bottom
        )
        let newOverlay = SKOverlay(configuration: configuration)
        overlay = newOverlay
        newOverlay.present(in: scene)
    }
}

private struct TotlandButtonStyle: ButtonStyle {
    let color: Color

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 20, weight: .black, design: .rounded))
            .frame(maxWidth: 280, minHeight: 54)
            .background(color.opacity(configuration.isPressed ? 0.78 : 1), in: RoundedRectangle(cornerRadius: 18))
            .foregroundStyle(.white)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
    }
}