package com.equimaps.capacitor_background_geolocation;

import android.content.Context;
import android.location.Location;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.MessageDigest;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** App-private, per-trip, authenticated encrypted append log. No WebView or tokens required. */
final class TripPointJournal {
    private static final String ALIAS = "jouw-driver-trip-points-v1";
    private static final long MAX_BYTES = 32L * 1024 * 1024;
    static void validate(String owner, String trip) {
        if (owner == null || !owner.matches("[1-9][0-9]{0,18}") || trip == null ||
            !trip.matches("(?i)[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}"))
            throw new IllegalArgumentException("Authenticated trip identity required");
    }
    private static File file(Context context, String owner, String trip) throws Exception {
        validate(owner, trip);
        StringBuilder name = new StringBuilder();
        for (byte b : MessageDigest.getInstance("SHA-256").digest((owner + ":" + trip).getBytes(StandardCharsets.UTF_8)))
            name.append(String.format("%02x", b & 255));
        return new File(context.getNoBackupFilesDir(), name + ".gps");
    }
    private static SecretKey key() throws Exception {
        KeyStore store = KeyStore.getInstance("AndroidKeyStore"); store.load(null);
        if (!store.containsAlias(ALIAS)) {
            KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
            generator.init(new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).setKeySize(256).build());
            generator.generateKey();
        }
        return (SecretKey) store.getKey(ALIAS, null);
    }
    static synchronized void append(Context context, String owner, String trip, Location location) throws Exception {
        if (location == null || location.isFromMockProvider() || !location.hasAccuracy() || location.getAccuracy() < 0 ||
            location.getTime() <= 0 || Math.abs(location.getLatitude()) > 90 || Math.abs(location.getLongitude()) > 180) return;
        JSObject point = new JSObject();
        point.put("latitude", location.getLatitude()); point.put("longitude", location.getLongitude());
        point.put("accuracy", location.getAccuracy()); point.put("time", location.getTime());
        if (location.hasSpeed()) point.put("speed", location.getSpeed());
        File log = file(context, owner, trip);
        if (log.length() > MAX_BYTES) throw new IOException("Trip point journal limit reached");
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE, key());
        cipher.updateAAD((owner + ":" + trip).getBytes(StandardCharsets.UTF_8));
        byte[] encrypted = cipher.doFinal(point.toString().getBytes(StandardCharsets.UTF_8));
        String line = Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP) + ":" + Base64.encodeToString(encrypted, Base64.NO_WRAP) + "\n";
        try (FileOutputStream out = new FileOutputStream(log, true)) {
            out.write(line.getBytes(StandardCharsets.UTF_8)); out.getFD().sync();
        }
    }
    static synchronized JSArray read(Context context, String owner, String trip, long after) throws Exception {
        File log = file(context, owner, trip); JSArray points = new JSArray();
        if (!log.exists()) return points;
        if (log.length() > MAX_BYTES + 4096) throw new IOException("Trip journal exceeds safe limit");
        try (RandomAccessFile in = new RandomAccessFile(log, "r")) {
            String line;
            while ((line = in.readLine()) != null) {
                // A crash may leave a torn final record. Refuse incomplete/corrupt logs rather than silently billing a gap.
                if (line.isEmpty() || !line.contains(":")) throw new IOException("Incomplete point journal");
                String[] parts = line.split(":", -1);
                if (parts.length != 2) throw new IOException("Invalid point journal");
                Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
                cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, Base64.decode(parts[0], Base64.NO_WRAP)));
                cipher.updateAAD((owner + ":" + trip).getBytes(StandardCharsets.UTF_8));
                JSObject point = new JSObject(new String(cipher.doFinal(Base64.decode(parts[1], Base64.NO_WRAP)), StandardCharsets.UTF_8));
                if (point.getLong("time") > after) points.put(point);
                if (points.length() >= 1000) break;
            }
        }
        return points;
    }
    static synchronized void clear(Context context, String owner, String trip) throws Exception {
        File log = file(context, owner, trip);
        if (log.exists() && !log.delete()) throw new IOException("Cannot remove acknowledged trip journal");
    }
}
