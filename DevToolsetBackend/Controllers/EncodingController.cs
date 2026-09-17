using DevToolsetBackend.DTOs;
using DevToolsetBackend.Services;
using Microsoft.AspNetCore.Mvc;
using FormatException = System.FormatException;

namespace DevToolsetBackend.Controllers;

[ApiController]
[Route("api/encoding")]
public class EncodingController : ControllerBase
{
    private readonly EncodingService _encodingService;

    public EncodingController(EncodingService encodingService)
    {
        _encodingService = encodingService;
    }

    [HttpPost("base64/encode")]
    public IActionResult Base64Encode(EncodingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Value))
        {
            return BadRequest(new
            {
                error = "Input cannot be empty."
            });
        }

        string encoded = _encodingService.Base64Encode(request.Value);

        return Ok(new
        {
            result = encoded
        });
    }

    [HttpPost("base64/decode")]
    public IActionResult Base64Decode(EncodingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Value))
        {
            return BadRequest(new
            {
                error = "Input cannot be empty."
            });
        }

        try
        {
            string decoded = _encodingService.Base64Decode(request.Value);

            return Ok(new
            {
                result = decoded
            });
        }
        catch (FormatException)
        {
            return BadRequest(new
            {
                error = "Invalid Base64 input."
            });
        }
    }

    [HttpPost("url/encode")]
    public IActionResult UrlEncode(EncodingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Value))
        {
            return BadRequest(new
            {
                error = "Input cannot be empty."
            });
        }

        string encoded = _encodingService.UrlEncode(request.Value);

        return Ok(new
        {
            result = encoded
        });
    }

    [HttpPost("url/decode")]
    public IActionResult UrlDecode(EncodingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Value))
        {
            return BadRequest(new
            {
                error = "Input cannot be empty."
            });
        }

        try
        {
            string decoded = _encodingService.UrlDecode(request.Value);

            return Ok(new
            {
                result = decoded
            });
        }
        catch (UriFormatException)
        {
            return BadRequest(new
            {
                error = "Invalid URL-encoded input."
            });
        }
    }
}
