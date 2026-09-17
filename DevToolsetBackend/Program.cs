using System.Threading.RateLimiting;
using DevToolsetBackend;
using DevToolsetBackend.Services;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddScoped<JsonService>();
builder.Services.AddScoped<EncodingService>();
builder.Services.AddScoped<SecurityService>();
builder.Services.AddScoped<GeneratorService>();

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = ApiLimits.MaxRequestBodyBytes;
});

builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options =>
{
    options.IncludeScopes = true;
    options.UseUtcTimestamp = true;
});

int permitLimit = Math.Max(
    1,
    builder.Configuration.GetValue("RateLimit:PermitLimit", 600)
);
int windowSeconds = Math.Max(
    1,
    builder.Configuration.GetValue("RateLimit:WindowSeconds", 60)
);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
        httpContext =>
        {
            if (httpContext.Request.Path.StartsWithSegments("/api/health"))
            {
                return RateLimitPartition.GetNoLimiter("health");
            }

            // Only the immediate connection address is trusted here. A client can
            // supply X-Forwarded-For through the public web rewrite.
            string key = httpContext.Connection.RemoteIpAddress?.ToString()
                ?? "unknown";

            return RateLimitPartition.GetFixedWindowLimiter(
                key,
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = permitLimit,
                    Window = TimeSpan.FromSeconds(windowSeconds),
                    QueueLimit = 0,
                    AutoReplenishment = true,
                }
            );
        }
    );
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsJsonAsync(
            new
            {
                error = "Too many requests.",
                message = "Please wait a moment and try again.",
            },
            cancellationToken
        );
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (builder.Configuration.GetValue("EnableHttpsRedirection", false))
{
    app.UseHttpsRedirection();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler(exceptionApp =>
    {
        exceptionApp.Run(async context =>
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/problem+json";

            await context.Response.WriteAsJsonAsync(
                new
                {
                    error = "The DevToolset API encountered an unexpected error.",
                    traceId = context.TraceIdentifier,
                }
            );
        });
    });
}

app.Use(async (context, next) =>
{
    string requestId = Guid.NewGuid().ToString("N");
    context.TraceIdentifier = requestId;
    context.Response.Headers["X-Request-ID"] = requestId;

    await next();
});

app.Use(async (context, next) =>
{
    if (context.Request.ContentLength > ApiLimits.MaxRequestBodyBytes)
    {
        context.Response.StatusCode = StatusCodes.Status413PayloadTooLarge;
        await context.Response.WriteAsJsonAsync(new
        {
            error = "Request body is too large.",
            message = "Reduce the input to 1 MiB or less.",
        });
        return;
    }

    await next();
});

app.UseRateLimiter();

app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program
{
}
