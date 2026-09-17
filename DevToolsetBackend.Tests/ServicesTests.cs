using System.Text.Json;
using DevToolsetBackend.Services;
using Xunit;

namespace DevToolsetBackend.Tests;

public class ServicesTests
{
    [Fact]
    public void JsonService_formats_and_minifies_json()
    {
        JsonService service = new();
        const string input = "{\"name\":\"DevToolset\",\"enabled\":true}";

        string formatted = service.Format(input);
        string minified = service.Minify(formatted);

        Assert.Contains("\n", formatted);
        Assert.Equal(input, minified);
        Assert.True(service.Validate(input));
    }

    [Fact]
    public void JsonService_rejects_invalid_json()
    {
        JsonService service = new();

        Assert.ThrowsAny<JsonException>(() => service.Format("{\"broken\":"));
        Assert.ThrowsAny<JsonException>(() => service.Minify("{\"broken\":"));
        Assert.ThrowsAny<JsonException>(() => service.Validate("{\"broken\":"));
    }

    [Fact]
    public void EncodingService_round_trips_unicode_and_urls()
    {
        EncodingService service = new();
        const string input = "Hello, 世界 🌍 & value=42";

        string encodedBase64 = service.Base64Encode(input);
        string encodedUrl = service.UrlEncode(input);

        Assert.Equal(input, service.Base64Decode(encodedBase64));
        Assert.Equal(input, service.UrlDecode(encodedUrl));
        Assert.Throws<FormatException>(() => service.Base64Decode("not base64"));
    }

    [Fact]
    public void SecurityService_hashes_supported_algorithms()
    {
        SecurityService service = new();

        Assert.Equal(
            "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
            service.Hash("hello", "SHA256")
        );
        Assert.NotEqual(service.Hash("hello", "SHA256"), service.Hash("hello", "SHA512"));
        Assert.Throws<ArgumentException>(() => service.Hash("hello", "MD5"));
    }

    [Fact]
    public void SecurityService_decodes_jwt_claims_without_verifying_signature()
    {
        SecurityService service = new();
        const string token = "eyJhbGciOiJub25lIn0.eyJzdWIiOiJkZW1vIn0.";

        object result = service.DecodeJwt(token);

        Assert.NotNull(result);
        Assert.Contains("header", result.ToString(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void GeneratorService_returns_non_empty_uuid()
    {
        Guid result = new GeneratorService().GenerateUuid();

        Assert.NotEqual(Guid.Empty, result);
    }
}
