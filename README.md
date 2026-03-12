<p align="center">
  <img src="assets/logos/logo-b-warehouse.svg" width="128" height="128" alt="FulFill logo" />
</p>

<h1 align="center">FulFill for WooCommerce</h1>

<p align="center">
  React Native mobile app for warehouse order fulfillment with WooCommerce.<br/>
  Allows warehouse staff to browse orders, scan barcodes to verify products, manage pick & pack workflows, and work offline with automatic sync.
</p>

## Features

- **Orders Management** — Browse, filter, and search WooCommerce orders. Pull-to-refresh and auto-polling for new orders.
- **Barcode Scanning** — Scan product barcodes using the device camera. Matches by SKU, then by meta keys (`_barcode`, `_ean`, `_gtin`, `_upc`).
- **Pick & Pack** — Per-order picking workflow with inline scanner. Track picked/missing/damaged items with progress bar.
- **Offline Support** — MMKV-backed local cache with mutation queue. Optimistic UI updates, auto-sync on reconnect with retry logic.
- **Order Notes** — View and add order notes (private or customer-facing).
- **Status Updates** — Change order status directly from the app with confirmation dialogs.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native CLI (bare) + TypeScript |
| Navigation | React Navigation (bottom tabs + native stack) |
| State | Zustand + persist middleware (MMKV storage) |
| HTTP | Axios + WooCommerce REST API v3 |
| Barcode | react-native-vision-camera v4 (CodeScanner) |
| Offline | MMKV cache + mutation queue with auto-sync |

## Project Structure

```
src/
├── api/            # Axios client, WC auth, orders/products/notes CRUD
├── components/
│   ├── common/     # Button, Card, Badge, LoadingSpinner, EmptyState, OfflineBanner
│   ├── orders/     # OrderCard, OrderLineItem, FilterBar, StatusBadge
│   ├── picking/    # PickItemRow, PickProgressBar, ScanResultOverlay
│   └── scanner/    # CameraView, ScanGuide
├── hooks/          # useOrders, useOrderDetail, useNetworkStatus, useBarcodeScanner, useSync
├── navigation/     # RootNavigator (auth gate), TabNavigator, OrdersStackNavigator
├── screens/        # LoginScreen, OrdersList, OrderDetail, PickAndPack, Scanner, Settings
├── stores/         # Zustand stores: auth, orders, picking, sync, settings
├── types/          # TypeScript types: order, product, picking, sync, api, navigation
└── utils/          # Barcode matching, formatters, MMKV adapter, notifications
```

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

## Building a Release

Push a git tag to trigger the GitHub Actions build:

```bash
git tag 1.0.0
git push --tags
```

This will build a release APK and create a GitHub Release with the artifact attached.

## Testing

```bash
# Run all tests
npm test

# Run specific suite
npx jest --testPathPattern="stores/syncStore"
```

## Key Design Decisions

- **MMKV** over AsyncStorage — ~30x faster, synchronous reads, no UI jank on hydration
- **Normalized store** — `Record<number, WcOrder>` for O(1) lookups, efficient single-order updates
- **Optimistic updates** — UI updates immediately, rolls back on network error
- **Mutation queue** — FIFO with max 5 retries per mutation, auto-flush on reconnect
- **Barcode matching** — SKU first (most reliable), then common meta keys (`_barcode`, `_ean`, `_gtin`, `_upc`)
- **Pick sessions not persisted** — Fresh start on app restart for accuracy (v1)

## License

Private
