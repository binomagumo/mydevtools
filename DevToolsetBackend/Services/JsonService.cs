using System.Text.Json;

namespace DevToolsetBackend.Services;

public class JsonService
{
    public string Format(string json)
    {
        using JsonDocument document = JsonDocument.Parse(json);

        JsonSerializerOptions options = new()
        {
            WriteIndented = true
        };

        return JsonSerializer.Serialize(document, options);
    }

    public bool Validate(string json)
    {
        using JsonDocument document = JsonDocument.Parse(json);

        return true;
    }

    public string Minify(string json)
    {
        using JsonDocument document = JsonDocument.Parse(json);

        JsonSerializerOptions options = new()
        {
            WriteIndented = false
        };

        return JsonSerializer.Serialize(document, options);
    }
}