using System.Text.Json;

namespace CountDownTimer;

/// <summary>Replaces the original app.config TimeValue setting (minutes, default 5).</summary>
internal static class Settings
{
    public static int TimeValue { get; } = Load();

    private static int Load()
    {
        const int defaultValue = 5;
        try
        {
            var path = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
            if (!File.Exists(path)) return defaultValue;

            using var doc = JsonDocument.Parse(File.ReadAllText(path));
            if (doc.RootElement.TryGetProperty("TimeValue", out var v) && v.TryGetInt32(out var n) && n >= 0)
                return n;
        }
        catch
        {
            // fall through to default
        }
        return defaultValue;
    }
}
