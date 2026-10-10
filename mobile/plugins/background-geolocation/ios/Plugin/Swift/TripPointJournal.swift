import Foundation
import CryptoKit
import Security

/// App-private authenticated point log, persisted before WebView delivery.
final class TripPointJournal {
    static let shared = TripPointJournal()
    private let lock = NSLock()
    private let service = "com.jouwdriver.trip-points.v1"
    private let limit = 32 * 1024 * 1024
    private func failure() -> NSError { NSError(domain: service, code: 1, userInfo: [NSLocalizedDescriptionKey: "Native trip journal unavailable"]) }
    private func file(_ owner: String, _ trip: String) throws -> URL {
        guard owner.range(of: "^[1-9][0-9]{0,18}$", options: .regularExpression) != nil,
              trip.range(of: "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$", options: .regularExpression) != nil else { throw failure() }
        let directory = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true).appendingPathComponent("trip-points", isDirectory: true)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true, attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication])
        var excluded = directory; var values = URLResourceValues(); values.isExcludedFromBackup = true
        try excluded.setResourceValues(values)
        let name = SHA256.hash(data: Data("\(owner):\(trip)".utf8)).map { String(format: "%02x", $0) }.joined()
        return directory.appendingPathComponent(name + ".gps")
    }
    private func key() throws -> SymmetricKey {
        let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: "installation-key"]
        var read = query; read[kSecReturnData as String] = true; read[kSecMatchLimit as String] = kSecMatchLimitOne
        var item: CFTypeRef?; let status = SecItemCopyMatching(read as CFDictionary, &item)
        if status == errSecSuccess, let bytes = item as? Data { return SymmetricKey(data: bytes) }
        guard status == errSecItemNotFound else { throw failure() }
        var bytes = Data(count: 32)
        guard bytes.withUnsafeMutableBytes({ SecRandomCopyBytes(kSecRandomDefault, 32, $0.baseAddress!) }) == errSecSuccess else { throw failure() }
        var create = query; create[kSecValueData as String] = bytes
        create[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        guard SecItemAdd(create as CFDictionary, nil) == errSecSuccess else { throw failure() }
        return SymmetricKey(data: bytes)
    }
    func append(owner: String, trip: String, point: [String: Any]) throws {
        lock.lock(); defer { lock.unlock() }; let url = try file(owner, trip)
        let ciphertext = try AES.GCM.seal(JSONSerialization.data(withJSONObject: point), using: key(), authenticating: Data("\(owner):\(trip)".utf8))
        guard let combined = ciphertext.combined else { throw failure() }
        if !FileManager.default.fileExists(atPath: url.path) {
            guard FileManager.default.createFile(atPath: url.path, contents: nil, attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication]) else { throw failure() }
        }
        let out = try FileHandle(forWritingTo: url); defer { try? out.close() }
        guard try out.seekToEnd() <= UInt64(limit) else { throw failure() }
        try out.write(contentsOf: Data((combined.base64EncodedString() + "\n").utf8)); try out.synchronize()
    }
    func read(owner: String, trip: String, after: Double) throws -> [[String: Any]] {
        lock.lock(); defer { lock.unlock() }; let url = try file(owner, trip)
        guard FileManager.default.fileExists(atPath: url.path) else { return [] }
        let attributes = try FileManager.default.attributesOfItem(atPath: url.path)
        guard ((attributes[.size] as? NSNumber)?.intValue ?? 0) <= limit + 4096 else { throw failure() }
        let data = try Data(contentsOf: url)
        guard data.last == 10, let text = String(data: data, encoding: .utf8) else { throw failure() }
        let secret = try key(); var points = [[String: Any]]()
        for line in text.split(separator: "\n") {
            guard let bytes = Data(base64Encoded: String(line)) else { throw failure() }
            let clear = try AES.GCM.open(AES.GCM.SealedBox(combined: bytes), using: secret, authenticating: Data("\(owner):\(trip)".utf8))
            guard let point = try JSONSerialization.jsonObject(with: clear) as? [String: Any], let time = point["time"] as? NSNumber else { throw failure() }
            if time.doubleValue > after { points.append(point) }; if points.count >= 1000 { break }
        }; return points
    }
    func clear(owner: String, trip: String) throws {
        lock.lock(); defer { lock.unlock() }; let url = try file(owner, trip)
        if FileManager.default.fileExists(atPath: url.path) { try FileManager.default.removeItem(at: url) }
    }
}
