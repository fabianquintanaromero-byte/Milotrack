import SwiftUI
import WebKit

@main
struct MiloTrackApp: App {
    var body: some Scene {
        WindowGroup { TrackingScreen() }
    }
}

struct TrackingScreen: View {
    @StateObject private var browser = TrackingBrowser()

    var body: some View {
        NavigationStack {
            ZStack {
                TrackingWebView(view: browser.view)
                if let error = browser.error {
                    VStack(spacing: 16) {
                        Image(systemName: "location.slash")
                            .font(.largeTitle)
                            .accessibilityHidden(true)
                        Text(error).multilineTextAlignment(.center)
                        Button("Volver a intentar") { browser.retry() }
                            .buttonStyle(.borderedProminent)
                    }
                    .padding(24)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(.background)
                }
            }
            .navigationTitle("MiloTrack")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    if browser.canGoBack {
                        Button { browser.view.goBack() } label: { Image(systemName: "chevron.backward") }
                            .accessibilityLabel("Volver")
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { browser.retry() } label: { Image(systemName: "arrow.clockwise") }
                        .accessibilityLabel("Actualizar MiloTrack")
                }
            }
            .safeAreaInset(edge: .top, spacing: 0) {
                if browser.loading { ProgressView().accessibilityLabel("Cargando MiloTrack") }
            }
        }
    }
}

struct TrackingWebView: UIViewRepresentable {
    let view: WKWebView
    func makeUIView(context: Context) -> WKWebView { view }
    func updateUIView(_ view: WKWebView, context: Context) {}
}

final class TrackingBrowser: NSObject, ObservableObject, WKNavigationDelegate, WKUIDelegate {
    private static let home = URL(string: "https://sos.maniaprod.com/milotrack/index.html")!
    let view: WKWebView
    @Published private(set) var loading = true
    @Published private(set) var error: String?
    @Published private(set) var canGoBack = false

    override init() {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.applicationNameForUserAgent = "MiloTrack-iOS/1.3.1"
        view = WKWebView(frame: .zero, configuration: configuration)
        super.init()
        view.navigationDelegate = self
        view.uiDelegate = self
        view.scrollView.contentInsetAdjustmentBehavior = .never
        view.load(URLRequest(url: Self.home))
    }

    func retry() {
        let previousError = error
        error = nil
        loading = true
        if previousError == nil, view.url != nil {
            view.reload()
        } else {
            view.load(URLRequest(url: Self.home))
        }
    }

    private func isSOS(_ url: URL) -> Bool {
        url.scheme == "https" && url.host == Self.home.host && (url.port == nil || url.port == 443)
    }

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url else { decisionHandler(.cancel); return }
        if isSOS(url) { decisionHandler(.allow); return }
        decisionHandler(.cancel)
        if action.navigationType == .linkActivated, url.scheme == "https",
           action.targetFrame?.isMainFrame != false {
            UIApplication.shared.open(url)
        }
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = action.request.url, isSOS(url) { webView.load(action.request) }
        return nil
    }

    func webView(_ webView: WKWebView, decidePolicyFor response: WKNavigationResponse,
                 decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        if response.isForMainFrame, let http = response.response as? HTTPURLResponse, http.statusCode >= 400 {
            decisionHandler(.cancel)
            loading = false
            error = "SOS respondió con un error (\(http.statusCode))."
            return
        }
        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        loading = true
        error = nil
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        loading = false
        canGoBack = webView.canGoBack
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        showConnectionError(error)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showConnectionError(error)
    }

    private func showConnectionError(_ cause: Error) {
        let networkError = cause as NSError
        guard networkError.domain != NSURLErrorDomain || networkError.code != NSURLErrorCancelled else { return }
        loading = false
        error = "No se pudo conectar con SOS. Comprueba tu conexión e inténtalo de nuevo."
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        loading = false
        error = "Se ha cerrado la vista del mapa. Vuelve a abrir MiloTrack."
    }
}
