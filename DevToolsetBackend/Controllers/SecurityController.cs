using DevToolsetBackend.DTOs;
using DevToolsetBackend.Services;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace DevToolsetBackend.Controllers;

[ApiController]
[Route("api/security")]
public class SecurityController : ControllerBase
{
    private readonly SecurityService _securityService;

    public SecurityController(SecurityService securityService)
    {
        _securityService = securityService;
    }

    [HttpPost("jwt/decode")]
    public IActionResult DecodeJwt([FromBody] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new
            {
                error = "JWT input cannot be empty."
            });
        }

        try
        {
            object result = _securityService.DecodeJwt(token);

            return Ok(result);
        }
        catch (ArgumentException)
        {
            return BadRequest(new
            {
                error = "Invalid JWT."
            });
        }
        catch (FormatException)
        {
            return BadRequest(new
            {
                error = "Invalid JWT format."
            });
        }
    }

    [HttpPost("hash")]
    public IActionResult Hash(HashRequest request)
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
            string result = _securityService.Hash(
                request.Value,
                request.Algorithm
            );

            return Ok(new
            {
                result,
                algorithm = request.Algorithm.ToUpperInvariant()
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                error = ex.Message
            });
        }
    }
}
