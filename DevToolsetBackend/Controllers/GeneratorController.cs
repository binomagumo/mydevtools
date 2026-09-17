using DevToolsetBackend.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevToolsetBackend.Controllers;

[ApiController]
[Route("api/generator")]
public class GeneratorController : ControllerBase
{
    private readonly GeneratorService _generatorService;

    public GeneratorController(GeneratorService generatorService)
    {
        _generatorService = generatorService;
    }

    [HttpPost("uuid")]
    public IActionResult GenerateUuid()
    {
        Guid uuid = _generatorService.GenerateUuid();

        return Ok(new
        {
            result = uuid
        });
    }
}
