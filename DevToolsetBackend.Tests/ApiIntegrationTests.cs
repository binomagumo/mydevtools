using System.Net;
using System.Net.Http.Json;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Xunit;

namespace DevToolsetBackend.Tests;

public class ApiIntegrationTests
{
    [Fact]
    public async Task Health_endpoint_returns_ok_and_request_id()
    {
        using WebApplicationFactory<Program> factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage response = await client.GetAsync("/api/health");
        HealthResponse? body = await response.Content.ReadFromJsonAsync<HealthResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("ok", body?.Status);
        Assert.False(string.IsNullOrWhiteSpace(response.Headers.GetValues("X-Request-ID").Single()));
    }

    [Fact]
    public async Task Tool_endpoints_return_expected_success_and_validation_responses()
    {
        using WebApplicationFactory<Program> factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage formatResponse = await client.PostAsJsonAsync(
            "/api/json/format",
            new { json = "{\"value\":1}" }
        );
        HttpResponseMessage invalidBase64Response = await client.PostAsJsonAsync(
            "/api/encoding/base64/decode",
            new { value = "not base64" }
        );
        HttpResponseMessage invalidHashResponse = await client.PostAsJsonAsync(
            "/api/security/hash",
            new { value = "hello", algorithm = "MD5" }
        );
        HttpResponseMessage invalidJwtResponse = await client.PostAsJsonAsync(
            "/api/security/jwt/decode",
            "not a jwt"
        );

        Assert.Equal(HttpStatusCode.OK, formatResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalidBase64Response.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalidHashResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalidJwtResponse.StatusCode);
    }

    [Theory]
    [InlineData("/api/json/format", "{\"json\":\"\"}")]
    [InlineData("/api/json/validate", "{\"json\":\"\"}")]
    [InlineData("/api/json/minify", "{\"json\":\"\"}")]
    [InlineData("/api/encoding/base64/encode", "{\"value\":\"\"}")]
    [InlineData("/api/encoding/base64/decode", "{\"value\":\"\"}")]
    [InlineData("/api/encoding/url/encode", "{\"value\":\"\"}")]
    [InlineData("/api/encoding/url/decode", "{\"value\":\"\"}")]
    [InlineData("/api/security/hash", "{\"value\":\"\",\"algorithm\":\"SHA256\"}")]
    [InlineData("/api/security/jwt/decode", "\"\"")]
    public async Task Tool_endpoints_reject_empty_input(string path, string body)
    {
        using WebApplicationFactory<Program> factory = CreateFactory();
        using HttpClient client = factory.CreateClient();
        using StringContent content = new(body, Encoding.UTF8, "application/json");

        using HttpResponseMessage response = await client.PostAsync(path, content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("not-a-jwt")]
    [InlineData("eyJhbGciOiJub25lIn0.invalid.")]
    public async Task Malformed_jwt_is_rejected_without_echoing_token(string token)
    {
        using WebApplicationFactory<Program> factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        using HttpResponseMessage response = await client.PostAsJsonAsync(
            "/api/security/jwt/decode",
            token
        );
        string body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.DoesNotContain(token, body);
    }

    [Fact]
    public async Task Tool_requests_are_rate_limited()
    {
        using WebApplicationFactory<Program> factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        for (int requestNumber = 0; requestNumber < 60; requestNumber++)
        {
            HttpResponseMessage response = await client.PostAsync("/api/generator/uuid", null);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        HttpResponseMessage rejectedResponse = await client.PostAsync("/api/generator/uuid", null);

        Assert.Equal(HttpStatusCode.TooManyRequests, rejectedResponse.StatusCode);
    }

    [Fact]
    public async Task Forwarded_for_header_cannot_bypass_rate_limit()
    {
        using WebApplicationFactory<Program> factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        for (int requestNumber = 0; requestNumber < 60; requestNumber++)
        {
            using HttpRequestMessage request = new(HttpMethod.Post, "/api/generator/uuid");
            request.Headers.Add("X-Forwarded-For", $"203.0.113.{requestNumber + 1}");
            using HttpResponseMessage response = await client.SendAsync(request);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        using HttpRequestMessage rejectedRequest = new(HttpMethod.Post, "/api/generator/uuid");
        rejectedRequest.Headers.Add("X-Forwarded-For", "198.51.100.1");
        using HttpResponseMessage rejectedResponse = await client.SendAsync(rejectedRequest);

        Assert.Equal(HttpStatusCode.TooManyRequests, rejectedResponse.StatusCode);
    }

    [Fact]
    public async Task Oversized_request_is_rejected_without_echoing_input()
    {
        using WebApplicationFactory<Program> factory = CreateFactory();
        using HttpClient client = factory.CreateClient();
        const string marker = "private-payload-marker";
        string input = marker + new string('x', 1_048_576);

        HttpResponseMessage response = await client.PostAsJsonAsync(
            "/api/json/format",
            new { json = input }
        );
        string body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
        Assert.DoesNotContain(marker, body);
        Assert.True(response.Headers.Contains("X-Request-ID"));
    }

    private static WebApplicationFactory<Program> CreateFactory()
    {
        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureLogging(logging => logging.ClearProviders());
            builder.ConfigureAppConfiguration((_, configuration) =>
            {
                configuration.AddInMemoryCollection(
                    new Dictionary<string, string?>
                    {
                        ["EnableHttpsRedirection"] = "false",
                        ["RateLimit:PermitLimit"] = "60",
                        ["RateLimit:WindowSeconds"] = "60",
                    }
                );
            });
        });
    }

    private sealed record HealthResponse(string Status);
}
