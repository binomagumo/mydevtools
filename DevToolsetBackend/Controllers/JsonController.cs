using DevToolsetBackend.DTOs;
using DevToolsetBackend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace DevToolsetBackend.Controllers;

[ApiController]
[Route("api/json")]
public class JsonController : ControllerBase
{
    private readonly JsonService _jsonService;

    public JsonController(JsonService jsonService)
    {
        _jsonService = jsonService;
    }

    [HttpPost("format")]
    public IActionResult Format(JsonRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Json))
        {
            return BadRequest(new
            {
                error = "JSON input cannot be empty."
            });
        }

        try
        {
            string formattedJson = _jsonService.Format(request.Json);

            return Ok(new
            {
                result = formattedJson
            });
        }
        catch (JsonException)
        {
            return BadRequest(new
            {
                error = "Invalid JSON.",
                message = "Check the syntax and try again."
            });
        }
    }

    [HttpPost("validate")]
    public IActionResult Validate(JsonRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Json))
        {
            return BadRequest(new
            {
                error = "JSON input cannot be empty."
            });
        }

        try
        {
            bool isValid = _jsonService.Validate(request.Json);

            return Ok(new
            {
                valid = isValid
            });
        }
        catch (JsonException)
        {
            return Ok(new
            {
                valid = false,
                error = "Invalid JSON.",
                message = "Check the syntax and try again."
            });
        }
    }

    [HttpPost("minify")]
    public IActionResult Minify(JsonRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Json))
        {
            return BadRequest(new
            {
                error = "JSON input cannot be empty."
            });
        }

        try
        {
            string minifiedJson = _jsonService.Minify(request.Json);

            return Ok(new
            {
                result = minifiedJson
            });
        }
        catch (JsonException)
        {
            return BadRequest(new
            {
                error = "Invalid JSON.",
                message = "Check the syntax and try again."
            });
        }
    }
}
