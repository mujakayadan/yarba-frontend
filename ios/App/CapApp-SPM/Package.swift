// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v16)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.5.1"),
        .package(name: "AparajitaCapacitorSecureStorage", path: "../../../node_modules/@aparajita/capacitor-secure-storage"),
        .package(name: "CapacitorApp", path: "../../../node_modules/@capacitor/app"),
        .package(name: "CapacitorAppLauncher", path: "../../../node_modules/@capacitor/app-launcher"),
        .package(name: "CapacitorBrowser", path: "../../../node_modules/@capacitor/browser"),
        .package(name: "CapacitorFilesystem", path: "../../../node_modules/@capacitor/filesystem"),
        .package(name: "CapacitorNetwork", path: "../../../node_modules/@capacitor/network"),
        .package(name: "CapacitorShare", path: "../../../node_modules/@capacitor/share"),
        .package(name: "CapacitorSplashScreen", path: "../../../node_modules/@capacitor/splash-screen"),
        .package(name: "CapawesomeCapacitorFilePicker", path: "../../../node_modules/@capawesome/capacitor-file-picker")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "AparajitaCapacitorSecureStorage", package: "AparajitaCapacitorSecureStorage"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorAppLauncher", package: "CapacitorAppLauncher"),
                .product(name: "CapacitorBrowser", package: "CapacitorBrowser"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorNetwork", package: "CapacitorNetwork"),
                .product(name: "CapacitorShare", package: "CapacitorShare"),
                .product(name: "CapacitorSplashScreen", package: "CapacitorSplashScreen"),
                .product(name: "CapawesomeCapacitorFilePicker", package: "CapawesomeCapacitorFilePicker")
            ]
        )
    ]
)
