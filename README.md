<p align="center">
  <img src="assets/logos/logo-b-warehouse.svg" width="128" height="128" alt="FulFill logo" />
</p>

<h1 align="center">FulFill for WooCommerce</h1>

<p align="center">
  React Native mobile app for warehouse order fulfillment with WooCommerce.<br/>
  Allows warehouse staff to browse orders, scan barcodes to verify products, manage pick & pack workflows, and work offline with automatic sync.
</p>

## Features

### Orders

- **Orders Management** — Browse, filter, and search WooCommerce orders. Pull-to-refresh and auto-polling for new orders.
- **Batch Status Update** — Long-press to select multiple orders, then change their status in one action. Select All supported.
- **Swipe Actions** — Swipe right on an order card to mark it completed, swipe left to view details.
- **Shake to Undo** — Shake your device to undo the last status change (single or batch).
- **Status-specific Feedback** — Different vibration patterns and sounds for each order status (completed, processing, on-hold, cancelled, failed).
- **Order Notes** — View and add order notes (private or customer-facing).
- **Status Updates** — Change order status directly from the app with confirmation dialogs.

### Barcode Scanning

- **Barcode Scanning** — Scan product barcodes using the device camera. Matches by SKU, then by meta keys (`_barcode`, `_ean`, `_gtin`, `_upc`).
- **Flashlight Toggle** — Turn on the camera torch for scanning in low-light environments.
- **Scan History** — Persisted list of the last 50 scans with product name, SKU, match status, and timestamp. Long-press to copy barcode.
- **Export Scan History** — Share scan history as CSV via the system share sheet.
- **Camera Permissions** — Automatic runtime permission request with fallback UI and link to device settings.

### Pick & Pack

- **Pick & Pack** — Per-order picking workflow with inline scanner. Track picked/missing/damaged items with progress bar.
- **Auto-Advance** — After completing an order, the app offers to open the next pending/processing order automatically.
- **Volume Button Scanner** — Press any volume button to activate/reset the barcode scanner during picking (hands-free scanning).

### Notifications

- **Daily Summary** — Scheduled morning notification (8:00 AM) with pending/processing/on-hold order counts. Toggle in Settings.
- **New Order Alerts** — Push notification when a new order arrives.

### Other

- **Offline Support** — MMKV-backed local cache with mutation queue. Optimistic UI updates, auto-sync on reconnect with retry logic.
- **Dark/Light/System Theme** — Full theme support with system preference detection.
- **Clipboard** — Long-press to copy order numbers, SKUs, and barcodes.

## Getting Started

### Prerequisites

- Node.js >= 22.11.0
- React Native CLI
- Xcode (iOS) / Android Studio (Android)

### Installation

```bash
npm install

# iOS
cd ios && pod install && cd ..

# Run
npx react-native run-ios
npx react-native run-android
```

### Connecting to WooCommerce

1. In your WooCommerce store, go to **Settings > Advanced > REST API**
2. Create API keys with Read/Write permissions
3. Open the app and enter your store URL, consumer key, and consumer secret

## Key Design Decisions

- **MMKV** over AsyncStorage — ~30x faster, synchronous reads, no UI jank on hydration
- **Normalized store** — `Record<number, WcOrder>` for O(1) lookups, efficient single-order updates
- **Optimistic updates** — UI updates immediately, rolls back on network error
- **Mutation queue** — FIFO with max 5 retries per mutation, auto-flush on reconnect
- **Barcode matching** — SKU first (most reliable), then common meta keys (`_barcode`, `_ean`, `_gtin`, `_upc`)
- **Pick sessions not persisted** — Fresh start on app restart for accuracy (v1)
- **Status-specific haptics** — Different vibration patterns per order status for tactile awareness
- **Auto-advance picking** — Reduces manual navigation between orders during high-volume fulfillment
