# CountDownTimer (cross-platform)

Cross-platform (.NET 8 + [Avalonia](https://avaloniaui.net/)) port of the WPF `WpfCountDownTimer` (HATSUNE, Akira, 2008). Runs on Windows, macOS and Linux.

## Behavior (same as the WPF original)
- Starts showing `Click`.
- **Double-click** starts the countdown of `TimeValue` minutes (default 5, see `appsettings.json`).
  - First start / after it expired: +30 s lead time. Double-click while running: restart with +5 s.
- Shows `mm:ss`. After reaching zero it counts up in **red**.
- At <= 1 s remaining the alarm sound plays once; a double-click stops it and restarts the timer.
- The text scales with the window (also when maximized).

## Differences from the WPF original
- `app.config` -> `appsettings.json` (next to the executable).
- `System.Media.SoundPlayer` -> winmm `PlaySound` (Windows), `afplay` (macOS), `paplay` (Linux).
- `ScaleTransform` logic -> Avalonia `Viewbox`.

## Build / run
```bash
dotnet run -c Release
```

## Publish single-file executables
```bash
dotnet publish -c Release -r win-x64   --self-contained -p:PublishSingleFile=true -o out/win-x64
dotnet publish -c Release -r osx-arm64 --self-contained -p:PublishSingleFile=true -o out/osx-arm64   # Apple Silicon
dotnet publish -c Release -r osx-x64   --self-contained -p:PublishSingleFile=true -o out/osx-x64     # Intel Mac
```
On macOS, if Gatekeeper blocks it: `xattr -d com.apple.quarantine CountDownTimer`, then `chmod +x CountDownTimer`.
